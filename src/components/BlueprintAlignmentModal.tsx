import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FaArrowsAlt, FaMapMarkerAlt, FaMagic } from 'react-icons/fa'
import { useAuth0 } from '@auth0/auth0-react'
import { io } from 'socket.io-client'
import type { BlueprintType, BlueprintAlignment } from '@/types/types'
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

const STAGE_MAX_W = 540
const STAGE_MAX_H = 460
const PANEL_MAX_W = 300
const PANEL_MAX_H = 420

// Fit a natural WxH into a box, preserving aspect ratio (so tall plans don't
// overflow the screen).
function fitBox(natW: number, natH: number, maxW: number, maxH: number): { w: number; h: number } {
  const ar = natW / natH
  let w = maxW, h = maxW / ar
  if (h > maxH) { h = maxH; w = maxH * ar }
  return { w: Math.round(w), h: Math.round(h) }
}

export default function BlueprintAlignmentModal({ open, onOpenChange, blueprint, onSaved }: Props) {
  const { getAccessTokenSilently } = useAuth0()

  const [counterpart, setCounterpart] = useState<BlueprintType | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)          // automatic re-align in progress
  const [alignment, setAlignment] = useState<BlueprintAlignment | undefined>(blueprint?.alignment)

  const [sim, setSim] = useState<Similarity>(() => matrixToSimilarity(IDENTITY))
  const [opacity, setOpacity] = useState(0.6)
  const [mode, setMode] = useState<'adjust' | 'points'>('adjust')

  const [srcNat, setSrcNat] = useState<Size | null>(null)
  const [dstNat, setDstNat] = useState<Size | null>(null)

  const [pairs, setPairs] = useState<Pair[]>([])
  const [pendingSrc, setPendingSrc] = useState<{ x: number; y: number } | null>(null)

  const runningRef = useRef(false)
  useEffect(() => { runningRef.current = running }, [running])

  const baseMatrix = (a?: BlueprintAlignment) => (a?.matrix?.length ? a.matrix : IDENTITY)

  // ---- load counterpart + init transform when opened -----------------------
  useEffect(() => {
    if (!open || !blueprint) return
    let cancelled = false
    setError('')
    setPairs([])
    setPendingSrc(null)
    setMode('adjust')
    setRunning(false)
    setAlignment(blueprint.alignment)
    setSim(matrixToSimilarity(baseMatrix(blueprint.alignment)))

    const run = async () => {
      setLoading(true)
      try {
        const src = blueprint.downloadUrl ? blueprint : await AlignmentService.getBlueprint(blueprint._id)
        if (cancelled) return
        setSourceUrl(src.downloadUrl ?? '')
        if (blueprint.alignment?.alignedWith) {
          const cp = await AlignmentService.getBlueprint(blueprint.alignment.alignedWith)
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
  }, [open, blueprint])

  // ---- live results: when the /alignment socket fires, refresh --------------
  useEffect(() => {
    if (!open || !blueprint) return
    let sock: ReturnType<typeof io> | null = null
    let active = true
    ;(async () => {
      try {
        const token = await getAccessTokenSilently()
        if (!active) return
        sock = io(`${import.meta.env.VITE_API_URL}/alignment`, {
          auth: { token: `Bearer ${token}` },
          transports: ['websocket'],
        })
        sock.on('connect', () => sock?.emit('subscribe', blueprint._id))
        sock.on('alignment:update', async () => {
          try {
            const a = await AlignmentService.getAlignment(blueprint._id)
            if (!active || !a) return
            setAlignment(a)
            // link (or refresh) the counterpart whenever one is now set
            if (a.alignedWith) {
              AlignmentService.getBlueprint(a.alignedWith).then((cp) => active && setCounterpart(cp)).catch(() => {})
            }
            // only overwrite the working transform if the user asked for auto re-align
            if (runningRef.current) {
              if (a.matrix?.length) setSim(matrixToSimilarity(a.matrix))
              setRunning(false)
            }
          } catch { /* ignore */ }
        })
      } catch { /* ignore socket errors */ }
    })()
    return () => { active = false; sock?.disconnect() }
  }, [open, blueprint, getAccessTokenSilently])

  const runAuto = async () => {
    if (!blueprint) return
    setRunning(true); setError('')
    try {
      await AlignmentService.triggerAlign(blueprint._id)   // result arrives over the socket
      setTimeout(() => setRunning(false), 30000)           // fallback so the spinner can't hang
    } catch {
      setRunning(false)
      setError('Could not start automatic re-alignment.')
    }
  }

  // ---- adjust-mode drag to translate ---------------------------------------
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const stage = dstNat ? fitBox(dstNat.w, dstNat.h, STAGE_MAX_W, STAGE_MAX_H) : { w: STAGE_MAX_W, h: STAGE_MAX_H }
  const dScale = dstNat ? stage.w / dstNat.w : 1

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
      await AlignmentService.saveAlignment(blueprint._id, {
        alignedWith: counterpart._id,
        matrix: similarityToMatrix(sim),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
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
          <div className="py-6 flex flex-col items-start gap-3">
            <p className="text-sm text-[var(--text-h)]">
              No counterpart is linked yet. Make sure another discipline's plan (architectural,
              structural, electrical, gas, water, …) for the same floor is uploaded and tagged in
              this project, then run automatic alignment to pair them.
            </p>
            <Button type="button" onClick={runAuto} disabled={running}>
              <FaMagic className="mr-1 size-4" /> {running ? 'Running auto…' : 'Attempt automatic alignment'}
            </Button>
          </div>
        )}

        {counterpart && (
          <>
            {/* Re-align: automatic OR manual */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wide text-[var(--text-h)]">Re-align</span>
              <Button type="button" variant="outline" size="sm" disabled={running} onClick={runAuto}>
                <FaMagic className="mr-1 size-4" /> {running ? 'Running auto…' : 'Automatic'}
              </Button>
              <span className="mx-1 text-[var(--text-h)]">·</span>
              <span className="text-xs text-[var(--text-h)]">Manual:</span>
              <Button type="button" variant={mode === 'adjust' ? 'default' : 'outline'} size="sm"
                disabled={running} onClick={() => setMode('adjust')}>
                <FaArrowsAlt className="mr-1 size-4" /> Adjust
              </Button>
              <Button type="button" variant={mode === 'points' ? 'default' : 'outline'} size="sm"
                disabled={running} onClick={() => setMode('points')}>
                <FaMapMarkerAlt className="mr-1 size-4" /> Point pairs
              </Button>
              <span className="ml-auto text-xs text-[var(--text-h)]">
                {mode === 'adjust'
                  ? 'Drag to move · sliders to rotate/scale'
                  : 'Click a point on the left, then its match on the right'}
              </span>
            </div>

            {mode === 'adjust' ? (
              <div className="flex gap-4">
                <div
                  className="relative overflow-hidden rounded border bg-white select-none touch-none"
                  style={{ width: stage.w, height: stage.h, opacity: running ? 0.5 : 1 }}
                  onPointerDown={onStagePointerDown}
                  onPointerMove={onStagePointerMove}
                  onPointerUp={onStagePointerUp}
                  onPointerLeave={onStagePointerUp}
                >
                  {counterpart?.downloadUrl && (
                    <img src={counterpart.downloadUrl} alt="counterpart" draggable={false}
                      style={{ width: stage.w, display: 'block' }}
                      onLoad={(e) => setDstNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />
                  )}
                  {sourceUrl && (
                    <img src={sourceUrl} alt="source" draggable={false}
                      style={{
                        position: 'absolute', top: 0, left: 0,
                        // render at NATURAL pixel size so the CSS transform (built in
                        // native coords) is correct - override Tailwind preflight's
                        // global `img { max-width: 100% }`.
                        width: srcNat?.w, height: srcNat?.h, maxWidth: 'none',
                        transformOrigin: '0 0', transform: cssMatrix(), opacity, cursor: 'move',
                      }}
                      onLoad={(e) => setSrcNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />
                  )}
                </div>

                <div className="flex flex-col gap-4 text-sm w-56">
                  <label className="flex flex-col gap-1">
                    Rotation <span className="font-mono">{sim.rotationDeg.toFixed(1)}°</span>
                    <input type="range" min={-180} max={180} step={0.5} value={sim.rotationDeg}
                      onChange={(e) => setSim((s) => ({ ...s, rotationDeg: Number(e.target.value) }))} />
                  </label>
                  <label className="flex flex-col gap-1">
                    Scale <span className="font-mono">{sim.scale.toFixed(3)}×</span>
                    <input type="range" min={-2} max={2} step={0.01} value={Math.log10(sim.scale || 1)}
                      onChange={(e) => setSim((s) => ({ ...s, scale: Math.pow(10, Number(e.target.value)) }))} />
                  </label>
                  <label className="flex flex-col gap-1">
                    Overlay opacity
                    <input type="range" min={0} max={1} step={0.05} value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))} />
                  </label>
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => setSim(matrixToSimilarity(baseMatrix(alignment)))}>
                    Reset to saved
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <PointPanel label="This blueprint" url={sourceUrl} nat={srcNat} setNat={setSrcNat}
                  points={pairs.map((p) => ({ x: p.sx, y: p.sy }))} pending={pendingSrc}
                  onPick={(e) => pickPoint(e, 'src', srcNat)} />
                <PointPanel label="Counterpart" url={counterpart?.downloadUrl ?? ''} nat={dstNat} setNat={setDstNat}
                  points={pairs.map((p) => ({ x: p.dx, y: p.dy }))} pending={null}
                  onPick={(e) => pickPoint(e, 'dst', dstNat)} />
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
          <Button onClick={save} disabled={!counterpart || saving || running}>
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
  const fit = nat ? fitBox(nat.w, nat.h, PANEL_MAX_W, PANEL_MAX_H) : { w: PANEL_MAX_W, h: PANEL_MAX_H }
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[var(--text-h)]">{label}</span>
      <div className="relative rounded border" style={{ width: fit.w }}>
        {url && (
          <img src={url} alt={label} draggable={false}
            style={{ width: fit.w, height: 'auto', maxWidth: 'none', display: 'block', cursor: 'crosshair' }}
            onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            onClick={onPick} />
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
