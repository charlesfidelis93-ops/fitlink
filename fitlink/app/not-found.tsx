import Link from 'next/link'
import { Ruler } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-5 text-center">
      <div className="bg-slate-800 rounded-2xl p-5 mb-6">
        <Ruler className="text-slate-500" size={40} />
      </div>
      <h1 className="text-3xl font-black mb-2">Profile not found</h1>
      <p className="text-slate-400 mb-8 max-w-sm">
        This measurement link doesn't exist or has been deleted by the owner.
      </p>
      <Link href="/" className="btn-primary max-w-xs">
        Create Your Own Profile
      </Link>
    </div>
  )
}
