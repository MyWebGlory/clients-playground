import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { RestoreRedirect } from '@/components/RestoreRedirect'
import ClientProjects from '@/pages/ClientProjects'
import Home from '@/pages/Home'
import StaticProject from '@/pages/StaticProject'

function LegacyProjectRedirect() {
  const { slug } = useParams<{ slug: string }>()
  return <Navigate to={`/clients/cbhn/projects/${slug ?? ''}`} replace />
}

export default function App() {
  return (
    <>
      <RestoreRedirect />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clients/:clientSlug" element={<ClientProjects />} />
        <Route path="/clients/:clientSlug/projects/:projectSlug" element={<StaticProject />} />
        <Route path="/projects/:slug" element={<LegacyProjectRedirect />} />
      </Routes>
    </>
  )
}
