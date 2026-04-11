'use client'
import { usePathname } from 'next/navigation'
import TopNav from './TopNav'

export default function NavWrapper() {
  const pathname = usePathname()
  const hideOn = ['/', '/login', '/signup', '/pricing', '/checkout']
  if (hideOn.some(p => pathname === p || pathname?.startsWith(p + '?'))) return null
  return <TopNav />
}
