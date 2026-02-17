import Link from 'next/link'
import { Ruler, Share2, Lock, Smartphone } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Nav */}
      <nav className="px-5 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Ruler className="text-indigo-400" size={22} />
          <span className="font-bold text-lg tracking-tight">FitLink</span>
        </div>
        <Link
          href="/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-500 transition-colors"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col px-5 pt-12 pb-8 max-w-lg mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-6">
            <span className="w-2 h-2 bg-indigo-400 rounded-full" />
            Free — No account fees
          </div>
          <h1 className="text-4xl font-black leading-tight mb-4">
            Stop re-measuring<br />
            <span className="text-indigo-400">every time</span> you sew clothes.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Store your measurements once. Share a secure link with any tailor. 
            They see exactly what they need — nothing else.
          </p>
        </div>

        {/* CTA */}
        <Link href="/create" className="btn-primary text-center mb-4">
          Create My Measurement Profile
        </Link>
        <p className="text-center text-slate-500 text-sm">
          Takes 2 minutes · Free forever
        </p>

        {/* Feature cards */}
        <div className="mt-12 space-y-4">
          <div className="card flex items-start gap-4">
            <div className="bg-indigo-900 rounded-xl p-3 shrink-0">
              <Ruler className="text-indigo-400" size={22} />
            </div>
            <div>
              <h3 className="font-bold mb-1">One profile. Forever.</h3>
              <p className="text-slate-400 text-sm">
                Enter your measurements once. Update whenever your size changes.
              </p>
            </div>
          </div>

          <div className="card flex items-start gap-4">
            <div className="bg-indigo-900 rounded-xl p-3 shrink-0">
              <Share2 className="text-indigo-400" size={22} />
            </div>
            <div>
              <h3 className="font-bold mb-1">Share with any tailor.</h3>
              <p className="text-slate-400 text-sm">
                Send a link via WhatsApp. No app required for the tailor.
              </p>
            </div>
          </div>

          <div className="card flex items-start gap-4">
            <div className="bg-indigo-900 rounded-xl p-3 shrink-0">
              <Lock className="text-indigo-400" size={22} />
            </div>
            <div>
              <h3 className="font-bold mb-1">PIN-protected edits.</h3>
              <p className="text-slate-400 text-sm">
                Only you can update your measurements with your 4-digit PIN.
              </p>
            </div>
          </div>

          <div className="card flex items-start gap-4">
            <div className="bg-indigo-900 rounded-xl p-3 shrink-0">
              <Smartphone className="text-indigo-400" size={22} />
            </div>
            <div>
              <h3 className="font-bold mb-1">Works on any phone.</h3>
              <p className="text-slate-400 text-sm">
                Built for mobile. Works outdoors in bright sunlight.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-10">
          No public profiles · No listing · Read-only links
        </p>
      </main>
    </div>
  )
}
