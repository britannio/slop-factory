'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  html_content: string;
  initial_prompt: string | null;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:8000/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        // Filter out projects with empty HTML content
        const validProjects = data.filter((p: Project) => p.html_content?.trim());
        setProjects(validProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="text-2xl font-mono">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="text-2xl font-mono text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      {/* Brutalist Header */}
      <header className="mb-12">
        <h1 className="text-5xl font-mono font-bold uppercase tracking-tight">
          SLOP FACTORY
        </h1>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-lg font-mono">
            {projects.length} website{projects.length !== 1 ? 's' : ''} generated
          </p>
          <Link
            href="/new"
            className="px-6 py-3 bg-black text-white font-mono hover:bg-gray-800 transition-colors border-2 border-black"
          >
            + NEW PROJECT
          </Link>
        </div>
      </header>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            className="group block bg-white border-4 border-black hover:border-gray-700 transition-colors"
          >
            {/* 16:9 Container */}
            <div className="relative w-full pt-[56.25%]">
              <iframe
                srcDoc={project.html_content}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                title={project.name}
              />
            </div>
            {/* Project Info */}
            <div className="p-4 border-t-4 border-black bg-white">
              <h2 className="font-mono font-bold text-lg uppercase truncate">
                {project.name}
              </h2>
              <p className="font-mono text-sm text-gray-600 mt-1 truncate">
                {project.initial_prompt || 'No description'}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-16">
          <p className="text-2xl font-mono mb-8">No projects yet</p>
          <Link
            href="/new"
            className="px-8 py-4 bg-black text-white font-mono hover:bg-gray-800 transition-colors inline-block border-2 border-black"
          >
            CREATE YOUR FIRST PROJECT
          </Link>
        </div>
      )}
    </div>
  );
}
