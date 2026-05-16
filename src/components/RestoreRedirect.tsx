import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function RestoreRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const redirect = params.get('redirect')
    if (redirect) {
      navigate(redirect, { replace: true })
    }
  }, [location, navigate])

  return null
}
