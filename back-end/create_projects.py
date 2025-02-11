import os
import logging
import asyncio
import aiohttp
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        # logging.FileHandler(f'project_creation_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

async def create_project(session: aiohttp.ClientSession, name: str, description: str) -> dict:
    """Create a single project using the FastAPI endpoint."""
    logger.info(f"Creating project: {name}")
    logger.debug(f"Project description: {description}")
    
    try:
        async with session.post(
            'http://localhost:8000/projects',
            json={'name': name, 'description': description}
        ) as response:
            logger.debug(f"Response status: {response.status}")
            
            if response.status != 200:
                error_text = await response.text()
                logger.error(f"Failed to create project. Status: {response.status}, Error: {error_text}")
                raise Exception(f"Failed to create project: {error_text}")
            
            project = await response.json()
            logger.info(f"Successfully created project {project['id']}: {project['name']}")
            logger.debug(f"Generated HTML length: {len(project['html_content'])} characters")
            return project
            
    except Exception as e:
        logger.error(f"Error creating project '{name}': {str(e)}", exc_info=True)
        raise

async def main():
    """Main function to process the projects file and create projects."""
    input_file = "projects.txt"
    logger.info(f"Starting batch project creation from {input_file}")
    
    try:
        # Check if file exists
        if not os.path.exists(input_file):
            logger.error(f"Input file {input_file} not found")
            return
        
        # Read and validate file contents
        with open(input_file, 'r') as f:
            lines = f.readlines()
        
        logger.info(f"Found {len(lines)} projects to create")
        
        # Process each project sequentially
        async with aiohttp.ClientSession() as session:
            for i, line in enumerate(lines, 1):
                line = line.strip()
                if not line:
                    logger.warning(f"Skipping empty line {i}")
                    continue
                
                try:
                    # Parse line
                    parts = line.split('|')
                    if len(parts) != 2:
                        logger.error(f"Invalid format in line {i}: {line}")
                        continue
                    
                    name = parts[0].strip()
                    description = parts[1].strip()
                    
                    logger.info(f"Processing project {i}/{len(lines)}")
                    project = await create_project(session, name, description)
                    
                    logger.debug(f"Project details: ID={project['id']}, Name={project['name']}")
                    
                except Exception as e:
                    logger.error(f"Failed to process line {i}: {str(e)}")
                    continue
        
        logger.info("Batch project creation completed")
        
    except Exception as e:
        logger.error(f"Error in batch processing: {str(e)}", exc_info=True)

if __name__ == "__main__":
    logger.info("Starting script")
    asyncio.run(main())
    logger.info("Script completed") 