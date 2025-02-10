'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
});

export default function NewProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting project creation...');
    console.log('Input values:', { name, description });
    
    setError('');
    setIsLoading(true);

    try {
      // Validate input
      console.log('Validating input...');
      const input = projectSchema.parse({ name, description });
      console.log('Input validation successful');

      // Create project using FastAPI backend
      console.log('Sending request to backend...');
      const response = await fetch('http://localhost:8000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: input.name,
          description: input.description,
        }),
      });

      console.log('Backend response status:', response.status);
      console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create project:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Failed to create project: ${response.status} ${response.statusText}`);
      }

      const project = await response.json();
      console.log('Project created successfully:', project);

      // Redirect to project page
      console.log('Redirecting to project page...');
      router.push(`/project/${project.id}`);
    } catch (err) {
      console.error('Error in project creation:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      console.log('Project creation flow completed');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Project Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              console.log('Name changed:', e.target.value);
              setName(e.target.value);
            }}
            className="w-full p-2 border rounded"
            placeholder="My Awesome Website"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => {
              console.log('Description changed:', e.target.value);
              setDescription(e.target.value);
            }}
            className="w-full p-2 border rounded h-32"
            placeholder="Describe your website..."
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
} 