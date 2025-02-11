'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProjects } from '@/app/actions';

interface Project {
  id: number;
  name: string;
  html_content: string;
  initial_prompt: string | null;
}

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projects = await getProjects();
        const projectData = projects.find(p => p.id === Number(id));
        
        if (!projectData) {
          throw new Error('Project not found');
        }
        
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch project');
      }
    };

    fetchProject();
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-2xl font-mono">
            {error || 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-orange-500">
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
        {/* Website Preview (Full Width) */}
        <div className="w-full p-8 bg-gray-100">
          <div className="w-full h-full border-8 border-black bg-white">
            <iframe
              srcDoc={project.html_content}
              className="w-full h-full"
              title="Website Preview"
            />
          </div>
        </div>

        {/* Chat Interface - Disabled */}
        {/* <div className="w-1/3 flex flex-col bg-white border-l-8 border-black">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
            <div className="p-4 border-4 border-black bg-white">
              <div className="text-sm">
                Messaging functionality is currently disabled.
              </div>
            </div>
          </div>

          <div className="p-4 border-t-8 border-black">
            <textarea
              placeholder="Messaging is disabled"
              className="w-full h-32 p-4 bg-gray-100 border-4 border-black font-mono text-sm resize-none"
              disabled
            />
            <button
              type="button"
              className="w-full mt-4 px-6 py-3 bg-gray-300 text-gray-600 font-mono border-4 border-black"
              disabled
            >
              SEND MESSAGE (DISABLED)
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
} 