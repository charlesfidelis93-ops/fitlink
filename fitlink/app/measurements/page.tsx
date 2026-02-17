'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveMeasurements } from '@/actions'
import { Ruler, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface MField {
  name: string
  label: string
  placeholder: string
  hint?: string
}

const UPPER: MField[] = [
  { name: 'height', label: 'Height', placeholder: '0.0', hint: 'cm' },
  { name: 'neck', label: 'Neck', placeholder: '0.0', hint: 'cm' },
  { name: 'shoulder', label: 'Shoulder Width', placeholder: '0.0', hint: 'cm' },
  { name: 'chest', label: 'Chest / Bust', placeholder: '0.0', hint: 'cm' },
  { name: 'arm', label: 'Arm Length', placeholder: '0.0', hint: 'cm' },
]

const LOWER: MField[] = [
  { name: 'waist', label: 'Waist', placeholder: '0.0', hint: 'cm' },
  { name: 'hip', label: 'Hip', placeholder: '0.0', hint: 'cm' },
  { name: 'thigh', label: 'Thigh', placeholder: '0.0', hint: 'cm' },
  { name: 'inseam', label: 'Inseam', placeholder: '0.0', hint: 'cm' },
]

function MeasurementField({ field }: { field: MField }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={field.name} className="text-sm font-semibold text-slate-300">
          {field.label}
        </label>
        {field.hint && (
          <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded-full">
            {field.hint}
          </span>
        )}
      </div>
      <input
        id={field.name}
        name={field.name}
        type="number"
        step="0.1"
        min="0"
        max="999"
        placeholder={field.placeholder}
        inputMode="decimal"
        className="w-full bg-slate-900 border-2 border-slate-600 rounded-xl px-4 py-4 text-3xl font-black text-white text-center focus:border-indigo-500 focus:outline-none transition-colors"
      />
    </div>
  )
}

export default function MeasurementsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shareToken = searchParams.get('token') || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!shareToken) {
      setError('Missing profile token. Please create a profile first.')
      return
    }
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await saveMeasurements(formData, shareToken)

    if (result.success) {
      router.push(`/m/${shareToken}?saved=1`)
    } else {
      setError(result.error || 'Failed to save')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 max-w-lg mx-auto px-5 pb-20">
      {/* Header */}
      <div className="py-5 flex items-center gap-3 sticky top-0 bg-slate-950 z-10">
        <Link href="/" className="text-slate-400 hover:text-white">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex items-center gap-2">
          <Ruler className="text-indigo-400" size={20} />
          <span className="font-bold">Enter Measurements</span>
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-6">
        Leave blank any measurements you don't have. All values in centimetres (cm).
      </p>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Upper Body */}
        <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
          Upper Body
        </h2>
        {UPPER.map(field => (
          <MeasurementField key={field.name} field={field} />
        ))}

        {/* Lower Body */}
        <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-4">
          Lower Body
        </h2>
        {LOWER.map(field => (
          <MeasurementField key={field.name} field={field} />
        ))}

        {/* Extras */}
        <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-4">
          Preferences
        </h2>

        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
          <label className="text-sm font-semibold text-slate-300 mb-3 block">
            Fit Preference
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['slim', 'regular', 'relaxed'] as const).map(pref => (
              <label key={pref} className="cursor-pointer">
                <input
                  type="radio"
                  name="fit_preference"
                  value={pref}
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
          <label className="text-sm font-semibold text-slate-300 mb-2 block">
            Notes for Tailor
          </label>
          <textarea
            name="notes"
            rows={3}
            maxLength={500}
            placeholder="e.g. Prefer extra room in shoulders, petite frame..."
            className="w-full bg-slate-900 border-2 border-slate-600 rounded-xl px-4 py-3 text-white text-base focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary mt-2" disabled={loading}>
          {loading ? 'Saving...' : 'Save & Get Share Link →'}
        </button>
      </form>
    </div>
  )
}
