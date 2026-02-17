'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateMeasurementsWithPin } from '@/actions'
import type { PublicMeasurements, PublicProfile } from '@/types'
import { Ruler, ChevronLeft, Check } from 'lucide-react'
import Link from 'next/link'

interface Props {
  shareToken: string
  measurements: PublicMeasurements | null
  profile: PublicProfile
}

interface Field {
  name: string
  label: string
  section: 'upper' | 'lower' | 'pref'
}

const FIELDS: Field[] = [
  { name: 'height', label: 'Height (cm)', section: 'upper' },
  { name: 'neck', label: 'Neck (cm)', section: 'upper' },
  { name: 'shoulder', label: 'Shoulder Width (cm)', section: 'upper' },
  { name: 'chest', label: 'Chest / Bust (cm)', section: 'upper' },
  { name: 'arm', label: 'Arm Length (cm)', section: 'upper' },
  { name: 'waist', label: 'Waist (cm)', section: 'lower' },
  { name: 'hip', label: 'Hip (cm)', section: 'lower' },
  { name: 'thigh', label: 'Thigh (cm)', section: 'lower' },
  { name: 'inseam', label: 'Inseam (cm)', section: 'lower' },
]

export default function EditForm({ shareToken, measurements, profile }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await updateMeasurementsWithPin(formData, shareToken)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => router.push(`/m/${shareToken}?updated=1`), 1000)
    } else {
      setError(result.error || 'Failed to save. Your session may have expired.')
      setLoading(false)
    }
  }

  const upper = FIELDS.filter(f => f.section === 'upper')
  const lower = FIELDS.filter(f => f.section === 'lower')

  return (
    <div className="min-h-screen bg-slate-950 max-w-lg mx-auto px-5 pb-20">
      {/* Header */}
      <div className="py-5 flex items-center gap-3 sticky top-0 bg-slate-950 z-10 border-b border-slate-800 mb-5">
        <Link href={`/m/${shareToken}`} className="text-slate-400 hover:text-white">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <Ruler className="text-indigo-400" size={18} />
          <span className="font-bold text-sm">Editing — {profile.display_name}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-900 rounded-full px-3 py-1">
          <div className="w-2 h-2 bg-indigo-400 rounded-full" />
          <span className="text-xs font-semibold text-indigo-300">Edit Mode</span>
        </div>
      </div>

      {success && (
        <div className="bg-green-950 border border-green-800 rounded-xl p-4 mb-5 flex items-center gap-3">
          <Check className="text-green-400 shrink-0" size={20} />
          <p className="text-green-300 font-semibold">Saved! Redirecting...</p>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Upper body */}
        <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
          Upper Body
        </h2>
        {upper.map(field => (
          <div key={field.name} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <label htmlFor={field.name} className="text-sm font-semibold text-slate-300 mb-2 block">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type="number"
              step="0.1"
              min="0"
              max="999"
              defaultValue={measurements?.[field.name as keyof PublicMeasurements] as number ?? ''}
              inputMode="decimal"
              placeholder="—"
              className="w-full bg-slate-900 border-2 border-slate-600 rounded-xl px-4 py-4 text-3xl font-black text-white text-center focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        ))}

        {/* Lower body */}
        <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-2">
          Lower Body
        </h2>
        {lower.map(field => (
          <div key={field.name} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <label htmlFor={field.name} className="text-sm font-semibold text-slate-300 mb-2 block">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type="number"
              step="0.1"
              min="0"
              max="999"
              defaultValue={measurements?.[field.name as keyof PublicMeasurements] as number ?? ''}
              inputMode="decimal"
              placeholder="—"
              className="w-full bg-slate-900 border-2 border-slate-600 rounded-xl px-4 py-4 text-3xl font-black text-white text-center focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        ))}

        {/* Fit preference */}
        <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-2">
          Preferences
        </h2>

        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <label className="text-sm font-semibold text-slate-300 mb-3 block">Fit Preference</label>
          <div className="grid grid-cols-3 gap-2">
            {(['slim', 'regular', 'relaxed'] as const).map(pref => (
              <label key={pref} className="cursor-pointer">
                <input
                  type="radio"
                  name="fit_preference"
                  value={pref}
                  defaultChecked={measurements?.fit_preference === pref}
                  className="sr-only peer"
                />
                <div className="text-center py-3 px-2 rounded-xl border-2 border-slate-600 peer-checked:border-indigo-500 peer-checked:bg-indigo-950 transition-colors text-sm font-semibold capitalize">
                  {pref}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <label className="text-sm font-semibold text-slate-300 mb-2 block">Notes</label>
          <textarea
            name="notes"
            rows={3}
            maxLength={500}
            defaultValue={measurements?.notes ?? ''}
            placeholder="e.g. Prefer extra room in shoulders..."
            className="w-full bg-slate-900 border-2 border-slate-600 rounded-xl px-4 py-3 text-white text-base focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary mt-2" disabled={loading || success}>
          {loading ? 'Saving...' : 'Save Measurements'}
        </button>

        <Link href={`/m/${shareToken}`} className="btn-secondary text-center block">
          Cancel
        </Link>
      </form>
    </div>
  )
}
