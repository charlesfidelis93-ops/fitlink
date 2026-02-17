import { notFound } from 'next/navigation'
import { getPublicProfile } from '@/actions'
import ShareActions from '@/components/ShareActions'
import MeasurementCard from '@/components/MeasurementCard'
import { Ruler, Lock, Calendar } from 'lucide-react'

interface Props {
  params: Promise<{ share_token: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { share_token } = await params
  const { saved } = await searchParams

  const data = await getPublicProfile(share_token)
  if (!data) notFound()

  const { profile, measurements } = data
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/m/${share_token}`

  return (
    <div className="min-h-screen bg-slate-950 max-w-lg mx-auto px-5 pb-20">
      {/* Header */}
      <div className="py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="text-indigo-400" size={20} />
          <span className="font-bold text-sm text-slate-400">FitLink</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800 rounded-full px-3 py-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-xs font-semibold text-slate-300">Read Only</span>
        </div>
      </div>

      {/* Saved banner */}
      {saved && (
        <div className="bg-green-950 border border-green-800 rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full shrink-0" />
          <div>
            <p className="font-bold text-green-300 text-sm">Profile saved!</p>
            <p className="text-green-400 text-xs">Share this link with your tailor</p>
          </div>
        </div>
      )}

      {/* Profile header */}
      <div className="card mb-5" id="measurement-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black">{profile.display_name}</h1>
            <p className="text-slate-400 capitalize text-sm">{profile.gender}</p>
          </div>
          <div className="bg-indigo-900 rounded-xl p-3">
            <Ruler className="text-indigo-400" size={20} />
          </div>
        </div>

        {measurements?.updated_at && (
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-5">
            <Calendar size={12} />
            <span>Updated {new Date(measurements.updated_at).toLocaleDateString()}</span>
          </div>
        )}

        <MeasurementCard measurements={measurements} />

        {measurements?.fit_preference && (
          <div className="mt-5 pt-5 border-t border-slate-700">
            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-widest">
              Fit Preference
            </p>
            <span className="bg-indigo-900 text-indigo-300 px-3 py-1.5 rounded-full text-sm font-bold capitalize">
              {measurements.fit_preference}
            </span>
          </div>
        )}

        {measurements?.notes && (
          <div className="mt-4 bg-slate-900 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-widest">
              Notes
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">{measurements.notes}</p>
          </div>
        )}
      </div>

      {/* Share actions */}
      <ShareActions shareUrl={shareUrl} shareToken={share_token} />

      {/* Tailor notice */}
      <div className="mt-4 flex items-center gap-2 bg-slate-900 rounded-xl px-4 py-3">
        <Lock size={14} className="text-slate-500 shrink-0" />
        <p className="text-slate-500 text-xs">
          This is a read-only view. Only the profile owner can make changes.
        </p>
      </div>
    </div>
  )
}
