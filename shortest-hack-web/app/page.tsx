import Link from 'next/link';
import { getProjectsStatic } from './actions';
import { LazyIframe } from './components/LazyIframe';

interface Project {
  id: number;
  name: string;
  html_content: string;
  initial_prompt: string | null;
}

export default async function Home() {
  const projects = await getProjectsStatic();
  // Filter out projects with empty HTML content
  const validProjects = (projects || []).filter((p: Project) => p.html_content?.trim());

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
            {validProjects.length} website{validProjects.length !== 1 ? 's' : ''} generated using LLMs
          </p>
          {/* <Link
            href="/new"
            className="px-6 py-3 bg-black text-white font-mono hover:bg-gray-800 transition-colors border-2 border-black"
          >
            + MAKE SLOP
          </Link> */}
        </div>
      </header>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {validProjects.map((project) => (
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
      {validProjects.length === 0 && (
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
