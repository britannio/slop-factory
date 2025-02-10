# 1. Introduction

**Product Name:**  
*Working Title: Brutalist Website Builder*

**Overview:**  
This website builder leverages NextJS for the frontend, Supabase for backend services (including authentication and data storage), and the Vercel AI SDK (integrated with Anthropic’s API) to generate websites on demand. Each generated website is embedded within an iframe, and users can refine these websites via an integrated chat interface. The product features a two-screen layout:
- A **homepage feed** that displays a grid (4 columns) of website previews in 16:9 iframes with titles.
- A **detailed view** for each website project, where the interface is split into a 5/6 portion showing the website and a 1/6 portion dedicated to an interactive chat for refinements.

**Design Theme:**  
Brutalist – emphasizing raw, utilitarian, and unpolished aesthetics.

---

# 2. Product Vision and Goals

**Vision:**  
Empower users to quickly generate and iterate on website designs using AI-driven content generation while embracing a distinctive brutalist design aesthetic.

**Goals:**
- **Rapid Generation:** Utilize the Anthropic API (via Vercel AI SDK) to generate websites dynamically.
- **User-Driven Refinement:** Allow users to refine generated websites through a dedicated chat interface.
- **Engaging UI:** Present generated websites in an attractive, scrollable feed and provide an intuitive project detail view.
- **Modern Tech Stack:** Build on NextJS, Supabase, and Vercel for performance, scalability, and ease of development.

---

# 3. Key Features & Functionality

### 3.1. Homepage Feed (Projects List)
- **Grid Layout:** A 4-column responsive grid.
- **Preview Thumbnails:** Each project is represented by an iframe preview (16:9 ratio) displaying the live website.
- **Titles & Metadata:** Each preview includes the website title and, optionally, additional metadata (creation date, status, etc.).
- **Brutalist Styling:** The overall design and UI elements should reflect a brutalist aesthetic—minimalistic, raw, and direct.

### 3.2. Project Detail View
- **Dual-Pane Layout:** 
  - **Primary Pane (5/6 of width):** Displays the live website (embedded via an iframe).
  - **Secondary Pane (1/6 of width):** A persistent chat window for user communication and refinements.
- **Chat Functionality:**
  - **Threaded Chat:** Maintain a conversation history per project.
  - **Refinement Commands:** Users can provide instructions or feedback that triggers the Anthropic API to generate updates or refinements to the website.
  - **Real-time Updates:** Display updates as they occur (or after a “regeneration” action).

### 3.3. Website Generation Flow
- **Project Creation:** 
  - User initiates a new project.
  - The system calls the Anthropic API (via Vercel AI SDK) to generate an initial website version.
- **Iteration Loop:** 
  - Users refine the website by sending messages via the chat.
  - Each refinement triggers a new API call to generate an updated version of the website.
  - Optionally, maintain version history for rollback or comparison.

### 3.4. Additional Functional Requirements
- **User Authentication & Management:**  
  - Use Supabase’s authentication (if required) to manage users and projects.
  - Define user roles if necessary (e.g., admin vs. regular user).
- **Data Storage:**  
  - Store project metadata, generated website code, and chat history in Supabase.
- **Performance Considerations:**  
  - Optimize iframe loading and ensure that chat/API interactions are handled asynchronously.
  - Consider caching frequently accessed projects or preloading iframes to enhance the user experience.

---

# 4. Technical Architecture

### 4.1. Frontend
- **Framework:** NextJS
- **Styling:** Custom CSS with a brutalist theme; possibly using a CSS framework with heavy customization.
- **Responsive Design:** Ensure the grid and detail view layouts are responsive across devices.

### 4.2. Backend & API
- **Backend-as-a-Service:** Supabase for:
  - User authentication
  - Database (project details, chat logs, version history)
- **Serverless Functions / API Routes:**  
  - Integrate with the Anthropic API via Vercel AI SDK.
  - Endpoints for initiating website generation, handling chat messages, and updating project data.
- **Hosting & Deployment:**  
  - Vercel for seamless integration with NextJS and AI SDK.

### 4.3. AI Integration
- **Anthropic API (via Vercel AI SDK):**  
  - Trigger generation on project creation and on receiving chat-based refinement instructions.
  - Handle the asynchronous nature of API calls, ensuring users are informed of generation progress.

---

# 5. User Flows & Use Cases

### 5.1. New User / Project Creation Flow
1. **Sign Up / Login:** (if authentication is required)
2. **Create a New Project:**  
   - User clicks “New Project.”
   - A loading state indicates that the website is being generated.
   - The generated website is stored and immediately available as an iframe preview.
3. **Refine Website:**  
   - User navigates to the project detail view.
   - Uses the chat interface to send a refinement request.
   - A new version of the website is generated and displayed.

### 5.2. Homepage Browsing Flow
1. **Landing on the Homepage:**  
   - User sees a scrollable feed of website previews.
   - Each preview shows the website (via an iframe) and the title.
2. **Project Selection:**  
   - User clicks on a preview.
   - User is taken to the detailed project view (split between chat and website).

### 5.3. Iterative Refinement Flow
1. **Interaction in the Chat:**  
   - User types feedback or instructions.
   - The system queues a call to the Anthropic API.
2. **Generation Update:**  
   - A new website version is generated and replaces (or layers on) the existing view.
   - Optionally, provide version control for users to revert changes.

---

# 6. UI/UX and Design Considerations

- **Brutalist Aesthetic:**  
  - Emphasize functionality over form—raw typography, basic color schemes, minimalistic controls.
  - Use strong borders, asymmetrical layouts, and unrefined design elements to evoke the brutalist style.
- **Navigation:**  
  - Simple navigation with clear entry points (e.g., “New Project,” “Home”).
  - Consistent placement of key actions (chat input, regenerate button, etc.).
- **Feedback & Loading States:**  
  - Clear indicators when the website is being generated or updated.
  - Error messages should be straightforward and in line with the brutalist tone.

---

# 7. Milestones & Timeline

1. **Phase 1 – MVP (Minimum Viable Product):**
   - Basic user authentication (if needed) using Supabase.
   - Homepage feed displaying a grid of generated website iframes.
   - Single project creation with initial website generation via Anthropic API.
   - Simple project detail view with split layout (iframe and chat).
2. **Phase 2 – Iteration & Refinement:**
   - Full integration of chat-based website refinements.
   - Improved UI/UX polish while staying true to brutalist design.
   - Implementation of version control for website iterations.
3. **Phase 3 – Additional Features & Optimization:**
   - Performance optimization (e.g., lazy loading of iframes).
   - Enhanced error handling, analytics, and potential collaborative features.
   - Explore additional integrations (e.g., exporting website code).

---

# 8. Open Questions & Clarifications

Before finalizing this PRD, I’d like to clarify the following points:

1. **User Authentication & Roles:**  
   - Do you require user accounts and authentication? If so, should we define different user roles (e.g., admin vs. regular user)?

2. **Refinement Process:**  
   - When a user sends a chat message, should it always trigger a full regeneration of the website, or are there cases where only incremental updates are made?
   - Would you like to maintain a version history for each project (allowing users to revert to earlier versions)?

3. **Iframe Usage:**  
   - Are the iframes solely for previews, or should the generated websites be fully interactive and capable of hosting dynamic content within the iframe?
   - Do you have any performance or security considerations for embedding live code in iframes?

4. **Design Details:**  
   - Could you provide more specifics about the brutalist theme you envision? (For example: color palettes, typography, specific design elements to include or avoid.)
   - Are there any existing examples or inspirations you’d like to mimic?

5. **Chat Functionality:**  
   - Should the chat support only text, or are you planning to integrate media or code snippets?
   - Do you have requirements for real-time updates (e.g., WebSocket integration) versus periodic polling for new messages?

6. **API Integration & Error Handling:**  
   - Are there any particular constraints or fallback strategies if the Anthropic API is slow to respond or fails?
