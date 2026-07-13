import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchUserProjects } from '@/lib/api';

interface ServerComponentProps {
  userId: string;
}

export default async function ServerComponent({ userId }: ServerComponentProps) {
  const projects = await fetchUserProjects(userId);

  return (
    <section className="container mx-auto py-12">
      <div className="flex flex-col gap-4 mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
          Your Projects
        </h2>
        <p className="text-muted-foreground text-lg">
          Manage your deployments and view analytics.
        </p>
      </div>

      <Suspense fallback={<ProjectGridSkeleton />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="group relative rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold leading-none tracking-tight">
                    {project.name}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              </div>
              <div className="flex items-center p-6 pt-0 mt-4 border-t">
                <a href={`/projects/${project.id}`} className="text-sm font-medium hover:underline text-primary">
                  View details &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </Suspense>
    </section>
  );
}

function ProjectGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}
