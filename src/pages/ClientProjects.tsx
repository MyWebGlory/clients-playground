import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, FileText, Folder, Globe } from 'lucide-react'
import { getClient } from '@/lib/clients'

export default function ClientProjects() {
  const { clientSlug } = useParams<{ clientSlug: string }>()
  const client = getClient(clientSlug)

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-950">Client not found</h1>
          <Link to="/" className="mt-4 inline-flex text-sm font-semibold text-zinc-600 hover:text-zinc-950">
            Back to clients
          </Link>
        </div>
      </div>
    )
  }

  const contextUrl = `${import.meta.env.BASE_URL}clients/${client.slug}/context.md`

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Clients
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white p-2">
                <img
                  src={`${import.meta.env.BASE_URL}${client.logoPath}`}
                  alt={client.shortName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{client.category}</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight">{client.name}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{client.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={contextUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
              >
                <FileText className="h-4 w-4" />
                Context
              </a>
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center gap-2">
          <Folder className="h-5 w-5 text-zinc-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600">Projects</h2>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-zinc-500">
            {client.projects.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {client.projects.map((project) => {
            const appPath = `/clients/${client.slug}/projects/${project.slug}`
            const rawPath = `${import.meta.env.BASE_URL}clients/${client.slug}/projects/${project.slug}/index.html`

            return (
              <article
                key={project.slug}
                className="rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
              >
                <div className={`h-1 rounded-t-lg bg-gradient-to-r ${project.color}`} />
                <div className="p-5">
                  <span className="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                    {project.category}
                  </span>
                  <h3 className="mt-4 text-lg font-bold tracking-tight">{project.title}</h3>
                  <p className="mt-2 min-h-24 text-sm leading-6 text-zinc-600">{project.description}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      to={appPath}
                      className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      <Folder className="h-4 w-4" />
                      Open
                    </Link>
                    <a
                      href={rawPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Raw HTML
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}
