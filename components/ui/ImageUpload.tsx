'use client'

import { useRef } from 'react'
import { useImageUpload } from '@/hooks/useImageUpload'

interface ImageUploadProps {
  value?: string
  onChange: (url: string, path: string) => void
  folder?: string
  label?: string
  aspectRatio?: 'square' | 'wide' | 'free'
  placeholder?: string
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'misc',
  label = 'Imagem',
  aspectRatio = 'square',
  placeholder = 'Clique para enviar imagem',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, uploading, progress } = useImageUpload({ folder, onSuccess: onChange })

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await upload(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'wide' ? 'aspect-video' : 'min-h-24'

  return (
    <div>
      {label && <p className="text-sm font-medium text-slate-700 mb-1.5">{label}</p>}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative ${aspectClass} w-full rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer transition-all`}
        style={{
          borderColor: value ? '#4CAF50' : '#c8e6c9',
          background: value ? 'transparent' : '#f1f8f1',
          maxHeight: aspectRatio === 'free' ? 120 : undefined,
        }}
      >
        {/* Imagem atual */}
        {value && (
          <img src={value} alt="Preview" className="w-full h-full object-contain bg-white" />
        )}

        {/* Overlay de upload */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity ${value && !uploading ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
          style={{ background: value ? 'rgba(0,0,0,0.4)' : 'transparent' }}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 animate-spin" style={{ color: value ? '#fff' : '#4CAF50' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs font-medium" style={{ color: value ? '#fff' : '#2E7D32' }}>
                {progress}%
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 p-3 text-center">
              <svg className="w-7 h-7" style={{ color: value ? '#fff' : '#4CAF50' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs font-medium" style={{ color: value ? '#fff' : '#2E7D32' }}>
                {value ? 'Trocar imagem' : placeholder}
              </p>
              <p className="text-[10px]" style={{ color: value ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                JPG, PNG, WebP · Máx 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
