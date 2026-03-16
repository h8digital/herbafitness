'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ImageCropUploadProps {
  value?: string
  onChange: (url: string, path: string) => void
  folder?: string
  label?: string
  aspectRatio?: '3/4' | '4/5' | '1/1' | '4/3' | '16/9'
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

const ASPECT_RATIOS = {
  '3/4': 3 / 4,
  '4/5': 4 / 5,
  '1/1': 1,
  '4/3': 4 / 3,
  '16/9': 16 / 9,
}

export default function ImageCropUpload({
  value,
  onChange,
  folder = 'products',
  label = 'Imagem do Produto',
  aspectRatio = '4/5',
}: ImageCropUploadProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0 })
  const [uploading, setUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 })
  const [imgDisplaySize, setImgDisplaySize] = useState({ w: 0, h: 0 })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const ratio = ASPECT_RATIOS[aspectRatio]

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('Arquivo muito grande. Máximo 10MB.'); return }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setOriginalImage(ev.target?.result as string)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  // Inicializar o crop quando a imagem carregar
  function handleImageLoad() {
    const img = imgRef.current
    if (!img) return

    const natW = img.naturalWidth
    const natH = img.naturalHeight
    const dispW = img.offsetWidth
    const dispH = img.offsetHeight

    setImgNaturalSize({ w: natW, h: natH })
    setImgDisplaySize({ w: dispW, h: dispH })

    // Calcular crop inicial centralizado com a proporção correta
    let cropW: number, cropH: number

    if (dispW / dispH > ratio) {
      // Imagem mais larga que o ratio — limitar pela altura
      cropH = dispH * 0.9
      cropW = cropH * ratio
    } else {
      // Imagem mais alta que o ratio — limitar pela largura
      cropW = dispW * 0.9
      cropH = cropW / ratio
    }

    setCrop({
      x: (dispW - cropW) / 2,
      y: (dispH - cropH) / 2,
      width: cropW,
      height: cropH,
    })
  }

  // Mouse/Touch drag para mover o crop
  function handleMouseDown(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()

    setDragging(true)
    setDragStart({
      x: clientX - rect.left,
      y: clientY - rect.top,
      cropX: crop.x,
      cropY: crop.y,
    })
  }

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragging || !imgDisplaySize.w) return
    e.preventDefault()

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const dx = (clientX - rect.left) - dragStart.x
    const dy = (clientY - rect.top) - dragStart.y

    const newX = Math.max(0, Math.min(imgDisplaySize.w - crop.width, dragStart.cropX + dx))
    const newY = Math.max(0, Math.min(imgDisplaySize.h - crop.height, dragStart.cropY + dy))

    setCrop(prev => ({ ...prev, x: newX, y: newY }))
  }, [dragging, dragStart, imgDisplaySize, crop.width, crop.height])

  const handleMouseUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleMouseMove, { passive: false })
      window.addEventListener('touchend', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleMouseMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [dragging, handleMouseMove, handleMouseUp])

  async function handleCropAndUpload() {
    if (!originalImage || !imgRef.current) return
    setUploading(true)

    try {
      const canvas = canvasRef.current!
      const img = imgRef.current

      // Escala de display para natural
      const scaleX = imgNaturalSize.w / imgDisplaySize.w
      const scaleY = imgNaturalSize.h / imgDisplaySize.h

      // Resolução de saída: 800x1000 (4:5) — ótimo para produto
      const outW = 800
      const outH = Math.round(outW / ratio)
      canvas.width = outW
      canvas.height = outH

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(
        img,
        crop.x * scaleX,      // source x
        crop.y * scaleY,      // source y
        crop.width * scaleX,  // source width
        crop.height * scaleY, // source height
        0, 0, outW, outH      // dest
      )

      // Converter para blob
      const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/webp', 0.88))

      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`

      const { data, error } = await supabase.storage
        .from('store-images')
        .upload(fileName, blob, { contentType: 'image/webp', cacheControl: '3600', upsert: false })

      if (error) throw error

      const { data: urlData } = supabase.storage.from('store-images').getPublicUrl(data.path)
      onChange(urlData.publicUrl, data.path)
      setShowCropper(false)
      setOriginalImage(null)
    } catch (err: any) {
      alert('Erro ao fazer upload: ' + err.message)
    }
    setUploading(false)
  }

  // Preview da proporção
  const previewStyle = aspectRatio === '3/4'
    ? 'aspect-[3/4]'
    : aspectRatio === '4/5'
    ? 'aspect-[4/5]'
    : aspectRatio === '4/3'
    ? 'aspect-[4/3]'
    : aspectRatio === '1/1'
    ? 'aspect-square'
    : 'aspect-video'

  return (
    <div>
      {label && <p className="text-sm font-medium text-slate-700 mb-1.5">{label}</p>}

      {/* Preview / área de upload */}
      <div
        onClick={() => !showCropper && inputRef.current?.click()}
        className={`relative ${previewStyle} w-full rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer transition-all group`}
        style={{ borderColor: value ? '#4CAF50' : '#c8e6c9', background: '#f1f8f1', maxWidth: 240 }}
      >
        {value ? (
          <>
            <img src={value} alt="Produto" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-xs font-bold">Trocar imagem</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <svg className="w-8 h-8" style={{ color: '#4CAF50' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs font-semibold text-center" style={{ color: '#2E7D32' }}>Clique para enviar</p>
            <p className="text-[10px] text-center text-slate-400">Proporção {aspectRatio} · JPG, PNG, WebP</p>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <canvas ref={canvasRef} className="hidden" />

      {/* Modal de Crop */}
      {showCropper && originalImage && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl">

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                  ✂️ Recortar Imagem
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Arraste para reposicionar · Proporção {aspectRatio}
                </p>
              </div>
              <button onClick={() => { setShowCropper(false); setOriginalImage(null) }}
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                ✕
              </button>
            </div>

            {/* Área do crop */}
            <div className="p-4">
              <div
                ref={containerRef}
                className="relative overflow-hidden rounded-xl bg-slate-900 select-none"
                style={{ maxHeight: '55vh', cursor: dragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
              >
                <img
                  ref={imgRef}
                  src={originalImage}
                  onLoad={handleImageLoad}
                  className="w-full h-auto block"
                  style={{ userSelect: 'none', pointerEvents: 'none', maxHeight: '55vh', objectFit: 'contain' }}
                  draggable={false}
                  alt="crop"
                />

                {/* Overlay escuro fora do crop */}
                {crop.width > 0 && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  >
                    <defs>
                      <mask id="crop-mask">
                        <rect width="100%" height="100%" fill="white" />
                        <rect
                          x={crop.x} y={crop.y}
                          width={crop.width} height={crop.height}
                          fill="black"
                        />
                      </mask>
                    </defs>
                    {/* Área escura */}
                    <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#crop-mask)" />
                    {/* Borda do crop */}
                    <rect
                      x={crop.x} y={crop.y}
                      width={crop.width} height={crop.height}
                      fill="none" stroke="#4CAF50" strokeWidth="2"
                    />
                    {/* Grid de terços */}
                    <line x1={crop.x + crop.width / 3} y1={crop.y} x2={crop.x + crop.width / 3} y2={crop.y + crop.height} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    <line x1={crop.x + (crop.width * 2) / 3} y1={crop.y} x2={crop.x + (crop.width * 2) / 3} y2={crop.y + crop.height} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    <line x1={crop.x} y1={crop.y + crop.height / 3} x2={crop.x + crop.width} y2={crop.y + crop.height / 3} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    <line x1={crop.x} y1={crop.y + (crop.height * 2) / 3} x2={crop.x + crop.width} y2={crop.y + (crop.height * 2) / 3} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                    {/* Cantos */}
                    {[
                      [crop.x, crop.y], [crop.x + crop.width - 16, crop.y],
                      [crop.x, crop.y + crop.height - 16], [crop.x + crop.width - 16, crop.y + crop.height - 16]
                    ].map(([cx, cy], i) => (
                      <g key={i}>
                        <rect x={cx} y={cy} width={16} height={3} fill="#4CAF50" rx="1" />
                        <rect x={cx} y={cy} width={3} height={16} fill="#4CAF50" rx="1" />
                      </g>
                    ))}
                  </svg>
                )}
              </div>

              <p className="text-center text-xs text-slate-400 mt-2">
                👆 Arraste a imagem para reposicionar o enquadramento
              </p>
            </div>

            {/* Botões */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => { setShowCropper(false); setOriginalImage(null) }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={handleCropAndUpload} disabled={uploading}
                className="flex-1 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Salvando...
                  </span>
                ) : '✅ Usar esta imagem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
