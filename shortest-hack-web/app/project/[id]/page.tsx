import Link from 'next/link';
import { getProjectsStatic, getProjectById } from '@/app/actions';
import { notFound } from 'next/navigation';
import { LazyIframe } from '@/app/components/LazyIframe';

interface Project {
  id: number;
  name: string;
  html_content: string;
  initial_prompt: string | null;
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// Revalidate every 30 days (2592000 seconds)
// Since this is a completed hackathon project, content rarely changes
export const revalidate = 2592000;

export async function generateStaticParams() {
  const projects = await getProjectsStatic();
  return projects.map((project) => ({
    id: project.id.toString(),
  }));
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  let project;
  try {
    project = await getProjectById(Number(id));
  } catch (error) {
    notFound();
  }

  if (!project) {
    notFound();
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

      {/* Main Content */}
      <div className="p-8 bg-gray-100">
        <div className="w-full border-8 border-black bg-white">
          <iframe
            srcDoc={project.html_content}
            className="w-full h-screen"
            title="Website Preview"
          />
        </div>
      </div>
    </div>
  );
} 