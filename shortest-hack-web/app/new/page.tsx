'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Brutalist Header */}
        <header className="mb-12">
          <Link 
            href="/"
            className="inline-block mb-8 px-4 py-2 bg-black text-white font-mono hover:bg-gray-800 transition-colors border-2 border-black"
          >
            ← BACK
          </Link>
          <h1 className="text-5xl font-mono font-bold uppercase tracking-tight">
            NEW SLOP
          </h1>
        </header>
        
        <form onSubmit={handleSubmit} className="max-w-5xl space-y-8 font-mono">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-lg uppercase font-bold">
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
              className="w-full p-4 bg-white border-4 border-black font-mono text-lg focus:outline-none focus:border-gray-700 transition-colors"
              placeholder="MY AWESOME WEBSITE"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-lg uppercase font-bold">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                console.log('Description changed:', e.target.value);
                setDescription(e.target.value);
              }}
              className="w-full h-48 p-4 bg-white border-4 border-black font-mono text-lg focus:outline-none focus:border-gray-700 transition-colors resize-none"
              placeholder="DESCRIBE YOUR WEBSITE..."
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-100 border-4 border-red-500 text-red-500 font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-4 bg-black text-white font-mono text-lg uppercase font-bold hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-colors border-4 border-black"
          >
            {isLoading ? 'GENERATING...' : 'GENERATE WEBSITE'}
          </button>
        </form>
      </div>
    </div>
  );
} 