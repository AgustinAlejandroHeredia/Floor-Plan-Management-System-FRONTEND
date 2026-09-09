import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FaArrowsAlt, FaMapMarkerAlt } from 'react-icons/fa'
import type { BlueprintType } from '@/types/types'
import { AlignmentService } from '@/services/AlignmentService'
import {
  IDENTITY,
  matrixToSimilarity,
  similarityFromPairs,
  similarityToMatrix,
  type Similarity,
} from '@/utils/alignmentGeometry'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  blueprint: BlueprintType | null
  onSaved?: () => void
}

interface Size { w: number; h: number }
interface Pair { sx: number; sy: number; dx: number; dy: number }

const STAGE_W = 560
const PANEL_W = 320

export default function BlueprintAlignmentModal({ open, onOpenChange, blueprint, onSaved }: Props) {
  const [counterpart, setCounterpart] = useState<BlueprintType | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [sim, setSim] = useState<Similarity>(() => matrixToSimilarity(IDENTITY))
  const [opacity, setOpacity] = useState(0.6)
  const [mode, setMode] = useState<'adjust' | 'points'>('adjust')

  const [srcNat, setSrcNat] = useState<Size | null>(null)
  const [dstNat, setDstNat] = useState<Size | null>(null)

  const [pairs, setPairs] = useState<Pair[]>([])
  const [pendingSrc, setPendingSrc] = useState<{ x: number; y: number } | null>(null)

  const alignment = blueprint?.alignment

  // ---- load counterpart + init transform when opened -----------------------
  useEffect(() => {
    if (!open || !blueprint) return
    let cancelled = false
    setError('')
    setPairs([])
    setPendingSrc(null)
    setMode('adjust')
    setSim(matrixToSimilarity(alignment?.matrix?.length ? alignment.matrix : IDENTITY))

    const run = async () => {
      setLoading(true)
      try {
        const src = blueprint.downloadUrl
          ? blueprint
          : await AlignmentService.getBlueprint(blueprint._id)
        if (cancelled) return
        setSourceUrl(src.downloadUrl ?? '')

        if (alignment?.alignedWith) {
          const cp = await AlignmentService.getBlueprint(alignment.alignedWith)
          if (!cancelled) setCounterpart(cp)
        } else {
          setCounterpart(null)
        }
      } catch {
        if (!cancelled) setError('Could not load the blueprints to align.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => { cancelled = true }
  }, [open, blueprint, alignment])

  // ---- adjust-mode drag to translate ---------------------------------------
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const dScale = dstNat ? STAGE_W / dstNat.w : 1

  const onStagePointerDown = (e: React.PointerEvent) => {
    if (mode !== 'adjust') return
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY, tx: sim.tx, ty: sim.ty }
  }
  const onStagePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const dx = (e.clientX - dragRef.current.x) / dScale
    const dy = (e.clientY - dragRef.current.y) / dScale
    setSim((s) => ({ ...s, tx: dragRef.current!.tx + dx, ty: dragRef.current!.ty + dy }))
  }
  const onStagePointerUp = () => { dragRef.current = null }

  // css matrix that maps source natural px -> stage display px
  const cssMatrix = useCallback(() => {
    const m = similarityToMatrix(sim)
    const d = dScale
    return `matrix(${d * m[0][0]},${d * m[1][0]},${d * m[0][1]},${d * m[1][1]},${d * m[0][2]},${d * m[1][2]})`
  }, [sim, dScale])

  // ---- points-mode picking --------------------------------------------------
  const pickPoint = (e: React.MouseEvent<HTMLImageElement>, which: 'src' | 'dst', nat: Size | null) => {
    if (mode !== 'points' || !nat) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * nat.w
    const y = ((e.clientY - r.top) / r.height) * nat.h
    if (which === 'src') {
      setPendingSrc({ x, y })
    } else if (pendingSrc) {
      setPairs((p) => [...p, { sx: pendingSrc.x, sy: pendingSrc.y, dx: x, dy: y }])
      setPendingSrc(null)
    }
  }
  const computeFromPairs = () => {
    const m = similarityFromPairs(pairs)
    if (!m) { setError('Pick at least 2 matching point pairs.'); return }
    setError('')
    setSim(matrixToSimilarity(m))
    setMode('adjust')
  }

  // ---- save -----------------------------------------------------------------
  const save = async () => {
    if (!blueprint || !counterpart) return
    setSaving(true)
    try {
      const matrix = similarityToMatrix(sim)
      await AlignmentService.saveAlignment(blueprint._id, {
        alignedWith: counterpart._id,
        matrix,
        scale: sim.scale,
        rotationDeg: sim.rotationDeg,
        translation: [sim.tx, sim.ty],
        status: 'manual',
      })
      onSaved?.()
      onOpenChange(false)
    } catch {
      setError('Failed to save the alignment.')
    } finally {
      setSaving(false)
    }
  }

  const stageH = dstNat ? STAGE_W * (dstNat.h / dstNat.w) : STAGE_W

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Align blueprint
            {alignment && (
              <span className="text-xs font-mono rounded-full border px-2 py-0.5 text-[var(--text-h)]">
                {alignment.status}
                {typeof alignment.confidence === 'number' && ` · conf ${alignment.confidence.toFixed(3)}`}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {!counterpart && !loading && (
          <p className="text-sm text-[var(--text-h)] py-6">
            No architectural/structural counterpart was found in this project to align against.
            Upload the complementary plan first.
          </p>
        )}

        {counterpart && (
          <>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={mode === 'adjust' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('adjust')}
              >
                <FaArrowsAlt className="mr-1 size-4" /> Adjust
              </Button>
              <Button
                type="button"
                variant={mode === 'points' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('points')}
              >
                <FaMapMarkerAlt className="mr-1 size-4" /> Manual points
              </Button>
              <span className="ml-auto text-xs text-[var(--text-h)]">
                {mode === 'adjust'
                  ? 'Drag to move · sliders to rotate/scale'
                  : 'Click a point on the left, then its match on the right'}
              </span>
            </div>

            {mode === 'adjust' ? (
              <div className="flex gap-4">
                {/* overlay stage */}
                <div
                  className="relative overflow-hidden rounded border bg-white select-none touch-none"
                  style={{ width: STAGE_W, height: stageH }}
                  onPointerDown={onStagePointerDown}
                  onPointerMove={onStagePointerMove}
                  onPointerUp={onStagePointerUp}
                  onPointerLeave={onStagePointerUp}
                >
                  {counterpart.downloadUrl && (
                    <img
                      src={counterpart.downloadUrl}
                      alt="counterpart"
                      draggable={false}
                      style={{ width: STAGE_W, display: 'block' }}
                      onLoad={(e) => setDstNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                    />
                  )}
                  {sourceUrl && (
                    <img
                      src={sourceUrl}
                      alt="source"
                      draggable={false}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transformOrigin: '0 0',
                        transform: cssMatrix(),
                        opacity,
                        cursor: 'move',
                      }}
                      onLoad={(e) => setSrcNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                    />
                  )}
                </div>

                {/* controls */}
                <div className="flex flex-col gap-4 text-sm w-56">
                  <label className="flex flex-col gap-1">
                    Rotation <span className="font-mono">{sim.rotationDeg.toFixed(1)}°</span>
                    <input type="range" min={-180} max={180} step={0.5}
                      value={sim.rotationDeg}
                      onChange={(e) => setSim((s) => ({ ...s, rotationDeg: Number(e.target.value) }))} />
                  </label>
                  <label className="flex flex-col gap-1">
                    Scale <span className="font-mono">{sim.scale.toFixed(3)}×</span>
                    <input type="range" min={-2} max={2} step={0.01}
                      value={Math.log10(sim.scale || 1)}
                      onChange={(e) => setSim((s) => ({ ...s, scale: Math.pow(10, Number(e.target.value)) }))} />
                  </label>
                  <label className="flex flex-col gap-1">
                    Overlay opacity
                    <input type="range" min={0} max={1} step={0.05}
                      value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
                  </label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => setSim(matrixToSimilarity(alignment?.matrix?.length ? alignment.matrix : IDENTITY))}>
                      Reset
                    </Button>
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => blueprint && void AlignmentService.triggerAlign(blueprint._id)}>
                      Re-run auto
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <PointPanel label="This blueprint" url={sourceUrl} nat={srcNat}
                  setNat={setSrcNat} points={pairs.map((p) => ({ x: p.sx, y: p.sy }))}
                  pending={pendingSrc} onPick={(e) => pickPoint(e, 'src', srcNat)} />
                <PointPanel label="Counterpart" url={counterpart.downloadUrl ?? ''} nat={dstNat}
                  setNat={setDstNat} points={pairs.map((p) => ({ x: p.dx, y: p.dy }))}
                  pending={null} onPick={(e) => pickPoint(e, 'dst', dstNat)} />
                <div className="flex flex-col gap-2 text-sm">
                  <span className="font-mono">{pairs.length} pair(s)</span>
                  <Button type="button" size="sm" disabled={pairs.length < 2} onClick={computeFromPairs}>
                    Compute alignment
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setPairs([]); setPendingSrc(null) }}>
                    Clear points
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={!counterpart || saving}>
            {saving ? 'Saving…' : 'Save alignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PointPanel({ label, url, nat, setNat, points, pending, onPick }: {
  label: string
  url: string
  nat: Size | null
  setNat: (s: Size) => void
  points: { x: number; y: number }[]
  pending: { x: number; y: number } | null
  onPick: (e: React.MouseEvent<HTMLImageElement>) => void
}) {
  const marks = pending ? [...points, pending] : points
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[var(--text-h)]">{label}</span>
      <div className="relative rounded border" style={{ width: PANEL_W }}>
        {url && (
          <img
            src={url}
            alt={label}
            draggable={false}
            style={{ width: PANEL_W, display: 'block', cursor: 'crosshair' }}
            onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            onClick={onPick}
          />
        )}
        {nat && marks.map((p, i) => (
          <span key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center"
            style={{ left: `${(p.x / nat.w) * 100}%`, top: `${(p.y / nat.h) * 100}%`, width: 16, height: 16 }}>
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  )
}
