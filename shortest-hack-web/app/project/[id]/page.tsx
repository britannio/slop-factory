'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  html_content: string;
  initial_prompt: string | null;
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Fetch project and messages
    const fetchData = async () => {
      console.log('Fetching project data...', { projectId: params.id });
      try {
        // Fetch project
        console.log('Fetching project details...');
        const projectResponse = await fetch(`http://localhost:8000/projects/${params.id}`);
        console.log('Project response status:', projectResponse.status);

        if (!projectResponse.ok) {
          const errorText = await projectResponse.text();
          console.error('Failed to fetch project:', {
            status: projectResponse.status,
            statusText: projectResponse.statusText,
            body: errorText,
          });
          throw new Error('Failed to fetch project');
        }

        const projectData = await projectResponse.json();
        console.log('Project data received:', {
          id: projectData.id,
          name: projectData.name,
          htmlLength: projectData.html_content?.length,
        });
        setProject(projectData);

        // Fetch messages
        console.log('Fetching messages...');
        const messagesResponse = await fetch(`http://localhost:8000/projects/${params.id}/messages`);
        console.log('Messages response status:', messagesResponse.status);

        if (!messagesResponse.ok) {
          const errorText = await messagesResponse.text();
          console.error('Failed to fetch messages:', {
            status: messagesResponse.status,
            statusText: messagesResponse.statusText,
            body: errorText,
          });
          throw new Error('Failed to fetch messages');
        }

        const messagesData = await messagesResponse.json();
        console.log('Messages received:', {
          count: messagesData.length,
          messages: messagesData.map(m => ({
            id: m.id,
            role: m.role,
            contentLength: m.content.length,
          })),
        });
        setMessages(messagesData);
      } catch (err) {
        console.error('Error fetching data:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
        });
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    console.log('Sending new message...', {
      projectId: params.id,
      messageLength: newMessage.length,
    });
    setIsLoading(true);

    try {
      console.log('Making request to backend...');
      const response = await fetch(`http://localhost:8000/projects/${params.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      console.log('Message response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send message:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error('Failed to send message');
      }

      console.log('Message sent successfully, refreshing data...');

      // Refresh messages and project
      const [messagesResponse, projectResponse] = await Promise.all([
        fetch(`http://localhost:8000/projects/${params.id}/messages`),
        fetch(`http://localhost:8000/projects/${params.id}`),
      ]);

      console.log('Refresh response statuses:', {
        messages: messagesResponse.status,
        project: projectResponse.status,
      });

      const [messagesData, projectData] = await Promise.all([
        messagesResponse.json(),
        projectResponse.json(),
      ]);

      console.log('Refresh data received:', {
        messageCount: messagesData.length,
        projectHtmlLength: projectData.html_content?.length,
      });

      setMessages(messagesData);
      setProject(projectData);
      setNewMessage('');
      console.log('State updated successfully');
    } catch (err) {
      console.error('Error in message flow:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      console.log('Message flow completed');
      setIsLoading(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-2xl font-mono">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="w-full bg-black text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-mono">
          <Link 
            href="/"
            className="px-4 py-2 border-2 border-white hover:bg-white hover:text-black transition-colors"
          >
            ← BACK TO SLOPS
          </Link>
          <h1 className="text-xl uppercase font-bold">{project.name}</h1>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Website Preview (5/6) */}
        <div className="w-5/6 p-8 bg-gray-100">
          <div className="w-full h-full border-8 border-black bg-white">
            <iframe
              srcDoc={project.html_content}
              className="w-full h-full"
              title="Website Preview"
              onLoad={() => console.log('iframe content loaded')}
            />
          </div>
        </div>

        {/* Chat Interface (1/6) */}
        <div className="w-1/6 flex flex-col bg-white border-l-8 border-black">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 border-4 ${
                  message.role === 'user' 
                    ? 'border-black bg-white' 
                    : 'border-gray-500 bg-gray-100'
                }`}
              >
                <div className="text-xs uppercase font-bold mb-2">
                  {message.role === 'user' ? 'YOU' : 'AI'}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {message.role === 'assistant' 
                    ? 'HTML generated.' 
                    : message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t-8 border-black">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border-4 border-red-500 text-red-500 font-mono">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  console.log('Message input changed:', e.target.value.length);
                  setNewMessage(e.target.value);
                }}
                placeholder="MODIFY YOUR WEBSITE..."
                className="w-full h-32 p-4 bg-white border-4 border-black font-mono text-sm focus:outline-none focus:border-gray-700 transition-colors resize-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full p-4 bg-black text-white font-mono text-sm uppercase font-bold hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-colors border-4 border-black"
              >
                {isLoading ? 'GENERATING...' : 'GENERATE'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 