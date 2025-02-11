'use client'
import Link from 'next/link';
import { getProjects } from './actions';
import { useEffect, useState, useRef } from 'react';

interface Project {
  id: number;
  name: string;
  html_content: string;
  initial_prompt: string | null;
}

function LazyIframe({ html, title }: { html: string; title: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full pt-[56.25%]">
      {isVisible ? (
        <iframe
          srcDoc={html}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          title={title}
        />
      ) : (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-100" />
      )}
    </div>
  );
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        // Filter out projects with empty HTML content
        const validProjects = (data || []).filter((p: Project) => p.html_content?.trim());
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
        <div className="flex justify-between items-start">
          <h1 className="text-5xl font-mono font-bold uppercase tracking-tight">
            SLOP FACTORY
          </h1>
          <div className="text-right font-mono">
            <a href="https://london.aitinkerers.org/p/uk-s-shortest-hackathon-february-10th" className="hover:underline">
              Winner of UK's Shortest Hackathon
            </a>
            <p className="mt-1">
              Made by <a href="https://britannio.com" className="hover:underline">britannio.com</a>
              {' • '}
              <a href="https://github.com/britannio/slop-factory" className="hover:underline">GitHub</a>
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-lg font-mono">
            {projects.length} website{projects.length !== 1 ? 's' : ''} generated using LLMs
          </p>
          <Link
            href="/new"
            className="px-6 py-3 bg-black text-white font-mono hover:bg-gray-800 transition-colors border-2 border-black"
          >
            + MAKE SLOP
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
            <LazyIframe 
              html={project.html_content} 
              title={project.name} 
            />
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
