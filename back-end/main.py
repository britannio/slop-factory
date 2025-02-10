from typing import Union, List
import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic

from models import db, Project, Message

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Anthropic client
anthropic = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
logger.info("Initialized Anthropic client")

# Pydantic models
class ProjectCreate(BaseModel):
    name: str
    description: str

class ProjectResponse(BaseModel):
    id: int
    name: str
    html_content: str
    initial_prompt: str | None

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: str

@app.get("/")
def read_root():
    logger.debug("Health check endpoint called")
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

async def process_message(message: Message):
    """Process a message using Claude and update the project."""
    logger.info(f"Processing message {message.id} for project {message.project.id}")
    try:
        # Get project and chat history (synchronous operations)
        project = message.project
        logger.debug(f"Retrieved project {project.id}: {project.name}")
        
        messages = list(Message.select().where(Message.project == project))
        logger.info(f"Retrieved {len(messages)} messages for project {project.id}")
        
        # Format chat history for Claude
        chat_history = [{
            'role': msg.role,
            'content': msg.content
        } for msg in messages]
        logger.debug(f"Formatted chat history with {len(chat_history)} messages")

        # Get AI response (synchronous operation)
        logger.info("Calling Claude API...")
        response = anthropic.messages.create(
            model='claude-3-5-sonnet-latest',
            max_tokens=8192,
            system="""You are a website generator. When asked to create or modify a website, respond with valid HTML that matches the request. 
                    The HTML should be complete and self-contained, including any necessary CSS and JavaScript.
                    Use modern, semantic HTML5.
                    Include beautiful styling directly in a <style> tag.
                    Make the design match brutalist principles - raw, utilitarian, and unpolished aesthetics.
                    Do not explain the code, just return the HTML.
                    The response should start with <html> and end with </html>.""",
            messages=[
                *chat_history
            ]
        )
        logger.info("Received response from Claude")
        ai_response = response.content[0].text
        logger.debug(f"Generated HTML length: {len(ai_response)} characters")

        # Save AI response (synchronous operations)
        logger.info("Saving AI response to database...")
        with db.atomic():
            # Create assistant message
            assistant_message = Message.create(
                project=project,
                role='assistant',
                content=ai_response,
                processed=True
            )
            logger.debug(f"Created assistant message {assistant_message.id}")

            # Update project HTML
            project.html_content = ai_response
            project.save()
            logger.debug(f"Updated project {project.id} HTML content")

            # Mark message as processed
            message.processed = True
            message.save()
            logger.debug(f"Marked message {message.id} as processed")

        logger.info(f"Successfully processed message {message.id}")

    except Exception as e:
        logger.error(f"Error processing message {message.id}: {str(e)}", exc_info=True)
        raise

@app.on_event("startup")
async def startup():
    logger.info("Starting up FastAPI application")
    db.connect()
    logger.debug("Connected to database")
    db.create_tables([Project, Message])
    logger.info("Created database tables")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down FastAPI application")
    db.close()
    logger.debug("Closed database connection")

@app.post("/projects", response_model=ProjectResponse)
async def create_project(project_data: ProjectCreate):
    """Create a new project and its initial message."""
    logger.info(f"Creating new project: {project_data.name}")
    try:
        # Create project
        project = Project.create(
            name=project_data.name,
            initial_prompt=project_data.description
        )
        logger.debug(f"Created project with ID {project.id}")

        # Create initial message
        initial_prompt = f"Create a website named {project_data.name} with the following description: {project_data.description}"
        message = Message.create(
            project=project,
            role='user',
            content=initial_prompt
        )
        logger.debug(f"Created initial message {message.id} for project {project.id}")

        # Process the message
        logger.info(f"Processing initial message for project {project.id}")
        await process_message(message)

        logger.info(f"Successfully created project {project.id}")
        return {
            'id': project.id,
            'name': project.name,
            'html_content': project.html_content,
            'initial_prompt': project.initial_prompt
        }
    except Exception as e:
        logger.error(f"Error creating project: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int):
    """Get a project by ID."""
    logger.info(f"Fetching project {project_id}")
    try:
        project = Project.get_by_id(project_id)
        logger.debug(f"Retrieved project {project_id}: {project.name}")
        return {
            'id': project.id,
            'name': project.name,
            'html_content': project.html_content,
            'initial_prompt': project.initial_prompt
        }
    except Project.DoesNotExist:
        logger.warning(f"Project {project_id} not found")
        raise HTTPException(status_code=404, detail="Project not found")

@app.post("/projects/{project_id}/messages", response_model=MessageResponse)
async def create_message(project_id: int, message_data: MessageCreate):
    """Create a new message for a project."""
    logger.info(f"Creating new message for project {project_id}")
    try:
        project = Project.get_by_id(project_id)
        logger.debug(f"Retrieved project {project_id}")

        message = Message.create(
            project=project,
            role='user',
            content=message_data.content
        )
        logger.debug(f"Created message {message.id}")

        # Process the message
        logger.info(f"Processing message {message.id}")
        await process_message(message)

        logger.info(f"Successfully created and processed message {message.id}")
        return {
            'id': message.id,
            'role': message.role,
            'content': message.content,
            'created_at': message.created_at.isoformat()
        }
    except Project.DoesNotExist:
        logger.warning(f"Project {project_id} not found")
        raise HTTPException(status_code=404, detail="Project not found")
    except Exception as e:
        logger.error(f"Error creating message: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects/{project_id}/messages", response_model=List[MessageResponse])
async def get_messages(project_id: int):
    """Get all messages for a project."""
    logger.info(f"Fetching messages for project {project_id}")
    try:
        project = Project.get_by_id(project_id)
        messages = Message.select().where(Message.project == project)
        message_list = list(messages)
        logger.debug(f"Retrieved {len(message_list)} messages for project {project_id}")
        return [{
            'id': msg.id,
            'role': msg.role,
            'content': msg.content,
            'created_at': msg.created_at.isoformat()
        } for msg in message_list]
    except Project.DoesNotExist:
        logger.warning(f"Project {project_id} not found")
        raise HTTPException(status_code=404, detail="Project not found")