'use client'

import { usePathname } from 'next/navigation'

// Hook that provides React Router useLocation compatibility with Next.js
export const useLocation = () => {
  const pathname = usePathname()

  return {
    pathname,
    // Add other properties that might be used from React Router's useLocation
    search: '',
    hash: '',
    state: null,
    key: 'default'
  }
}

export default useLocation
