'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle, Download, Pencil, Trash2 } from 'lucide-react'

interface Props {
  shareUrl: string
  shareToken: string
}

export default function ShareActions({ shareUrl, shareToken }: Props) {
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = shareUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  function handleWhatsApp() {
    const text = `Here are my body measurements: ${shareUrl}`
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleSaveImage() {
    setSaving(true)
    try {
      // Dynamic import to keep bundle size down
      const html2canvas = (await import('html2canvas')).default
      const card = document.getElementById('measurement-card')
      if (!card) return

      const canvas = await html2canvas(card, {
        backgroundColor: '#1e293b',
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const link = document.createElement('a')
      link.download = 'my-measurements.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Screenshot failed:', err)
      alert('Could not save image. Try taking a screenshot manually.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* URL display */}
      <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
        <p className="text-xs text-slate-500 mb-1 font-semibold">Your Share Link</p>
        <p className="text-indigo-300 text-sm break-all font-mono leading-relaxed">
          {shareUrl}
        </p>
      </div>

      {/* Primary actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors touch-manipulation"
        >
          {copied ? (
            <>
              <Check size={18} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={18} />
              Copy Link
            </>
          )}
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20B858] active:bg-[#1CA34D] text-white font-bold py-4 rounded-xl transition-colors touch-manipulation"
        >
          <MessageCircle size={18} />
          WhatsApp
        </button>
      </div>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-colors touch-manipulation disabled:opacity-50 text-sm"
        >
          <Download size={16} />
          {saving ? 'Saving...' : 'Save Image'}
        </button>

        <a
          href={`/unlock/${shareToken}`}
          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-colors touch-manipulation text-sm"
        >
          <Pencil size={16} />
          Edit
        </a>
      </div>

      {/* Delete account */}
      <a
        href="/delete"
        className="flex items-center justify-center gap-2 w-full py-3 text-red-500 hover:text-red-400 text-sm font-semibold transition-colors"
      >
        <Trash2 size={14} />
        Delete my account
      </a>
    </div>
  )
}
