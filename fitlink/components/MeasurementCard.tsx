import type { PublicMeasurements } from '@/types'

interface Props {
  measurements: PublicMeasurements | null
}

interface MRow {
  label: string
  key: keyof PublicMeasurements
  emoji: string
}

const UPPER: MRow[] = [
  { label: 'Height', key: 'height', emoji: '📏' },
  { label: 'Neck', key: 'neck', emoji: '🔵' },
  { label: 'Shoulder', key: 'shoulder', emoji: '🔵' },
  { label: 'Chest / Bust', key: 'chest', emoji: '🔵' },
  { label: 'Arm Length', key: 'arm', emoji: '🔵' },
]

const LOWER: MRow[] = [
  { label: 'Waist', key: 'waist', emoji: '🔵' },
  { label: 'Hip', key: 'hip', emoji: '🔵' },
  { label: 'Thigh', key: 'thigh', emoji: '🔵' },
  { label: 'Inseam', key: 'inseam', emoji: '🔵' },
]

function Row({ label, value }: { label: string; value: number | null | undefined }) {
  if (value == null) return null
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
      <span className="text-slate-400 text-sm font-medium">{label}</span>
      <span className="text-white text-xl font-black tabular-nums">
        {value}
        <span className="text-slate-500 text-sm font-normal ml-1">cm</span>
      </span>
    </div>
  )
}

export default function MeasurementCard({ measurements }: Props) {
  if (!measurements) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">No measurements entered yet.</p>
      </div>
    )
  }

  const hasUpper = UPPER.some(r => measurements[r.key] != null)
  const hasLower = LOWER.some(r => measurements[r.key] != null)

  if (!hasUpper && !hasLower) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">No measurements entered yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {hasUpper && (
        <div>
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">
            Upper Body
          </p>
          <div>
            {UPPER.map(r => (
              <Row
                key={r.key}
                label={r.label}
                value={measurements[r.key] as number | null}
              />
            ))}
          </div>
        </div>
      )}

      {hasLower && (
        <div>
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">
            Lower Body
          </p>
          <div>
            {LOWER.map(r => (
              <Row
                key={r.key}
                label={r.label}
                value={measurements[r.key] as number | null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
