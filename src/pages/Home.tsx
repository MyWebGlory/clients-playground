import { Link } from 'react-router-dom'
import { ExternalLink, Folder, Users } from 'lucide-react'
import { clients, getTotalProjectCount } from '@/lib/clients'

export default function Home() {
  const totalProjects = getTotalProjectCount()

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Project workspace</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Clients Playground</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 sm:flex">
            <Users className="h-4 w-4" />
            <span>{clients.length} clients</span>
            <span className="text-zinc-300">/</span>
            <Folder className="h-4 w-4" />
            <span>{totalProjects} projects</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-zinc-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600">Clients</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {clients.map((client) => (
            <article
              key={client.slug}
              className="group rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
            >
              <div className={`h-1 rounded-t-lg bg-gradient-to-r ${client.color}`} />
              <div className="p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white p-2">
                      <img
                        src={`${import.meta.env.BASE_URL}${client.logoPath}`}
                        alt={client.shortName}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                        {client.category}
                      </span>
                      <h3 className="mt-2 text-xl font-bold tracking-tight">{client.name}</h3>
                    </div>
                  </div>
                </div>

                <p className="min-h-16 text-sm leading-6 text-zinc-600">{client.description}</p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/clients/${client.slug}`}
                    className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    <Folder className="h-4 w-4" />
                    {client.projects.length} projects
                  </Link>
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
