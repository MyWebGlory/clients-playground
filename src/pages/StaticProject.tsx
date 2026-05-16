import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getClient, getProject } from '@/lib/clients'

export default function StaticProject() {
  const { clientSlug, projectSlug } = useParams<{ clientSlug: string; projectSlug: string }>()
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const client = getClient(clientSlug)
  const project = getProject(clientSlug, projectSlug)

  useEffect(() => {
    if (!clientSlug || !projectSlug) {
      return
    }

    const iframe = iframeRef.current
    if (!iframe) {
      return
    }

    const storageKey = `clients-playground:iframe-scroll:${clientSlug}:${projectSlug}`
    let detachScrollListener: (() => void) | null = null

    const savePosition = () => {
      const y = iframe.contentWindow?.scrollY
      if (typeof y === 'number') {
        sessionStorage.setItem(storageKey, String(y))
      }
    }

    const restorePosition = () => {
      const raw = sessionStorage.getItem(storageKey)
      if (!raw) {
        return
      }

      const y = Number(raw)
      if (Number.isNaN(y)) {
        return
      }

      requestAnimationFrame(() => {
        iframe.contentWindow?.scrollTo({ top: y, behavior: 'auto' })
      })
    }

    const attachInnerScrollListener = () => {
      const innerWindow = iframe.contentWindow
      if (!innerWindow) {
        return
      }

      const onInnerScroll = () => savePosition()
      innerWindow.addEventListener('scroll', onInnerScroll, { passive: true })

      detachScrollListener = () => {
        innerWindow.removeEventListener('scroll', onInnerScroll)
      }
    }

    const onIframeLoad = () => {
      detachScrollListener?.()
      restorePosition()
      attachInnerScrollListener()
    }

    iframe.addEventListener('load', onIframeLoad)
    window.addEventListener('beforeunload', savePosition)

    return () => {
      savePosition()
      detachScrollListener?.()
      iframe.removeEventListener('load', onIframeLoad)
      window.removeEventListener('beforeunload', savePosition)
    }
  }, [clientSlug, projectSlug])

  if (!client || !project || !clientSlug || !projectSlug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Project not found</h1>
          <Link to="/" className="mt-4 inline-flex text-sm font-semibold text-white/70 hover:text-white">
            Back to clients
          </Link>
        </div>
      </div>
    )
  }

  const standaloneUrl = `${import.meta.env.BASE_URL}clients/${clientSlug}/projects/${projectSlug}/index.html`

  return (
    <>
      <style>{`
        @media print {
          .project-toolbar { display: none !important; }
          .project-iframe {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            min-height: 100vh !important;
            border: none !important;
          }
        }
      `}</style>
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <div className="project-toolbar flex items-center gap-3 border-b border-white/10 bg-black/50 px-4 py-2">
          <Link
            to={`/clients/${client.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {client.shortName}
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-xs font-semibold text-white/80">{project.title}</span>
          <div className="ml-auto">
            <a
              href={standaloneUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-white/10 px-2 py-1 text-xs font-medium text-white/50 transition hover:border-white/30 hover:text-white"
              title="Open standalone for clean PDF export"
            >
              <ExternalLink className="h-3 w-3" />
              Open for print
            </a>
          </div>
        </div>

        <iframe
          ref={iframeRef}
          src={standaloneUrl}
          title={`${client.shortName}: ${project.title}`}
          className="project-iframe w-full flex-1 border-none"
          style={{ minHeight: 'calc(100vh - 40px)' }}
        />
      </div>
    </>
  )
}
