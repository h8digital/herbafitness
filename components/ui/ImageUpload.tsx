'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  value?: string
  onChange: (url: string, path: string) => void
  folder?: string
  label?: string
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'products',
  label = 'Imagem do Produto',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('Arquivo muito grande. Máximo 10MB.'); return }
    if (inputRef.current) inputRef.current.value = ''

    setUploading(true)
    setProgress(20)

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      setProgress(50)

      const { data, error } = await supabase.storage
        .from('store-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (error) throw error
      setProgress(90)

      const { data: urlData } = supabase.storage.from('store-images').getPublicUrl(data.path)
      onChange(urlData.publicUrl, data.path)
      setProgress(100)
    } catch (err: any) {
      alert('Erro ao fazer upload: ' + err.message)
    } finally {
      setTimeout(() => { setUploading(false); setProgress(0) }, 400)
    }
  }

  return (
    <div>
      {label && <p className="text-sm font-medium text-slate-700 mb-1.5">{label}</p>}

      {value ? (
        <div className="relative group mb-3" style={{ maxWidth: 240 }}>
          <img src={value} alt="Produto"
            className="w-full rounded-2xl border border-slate-200 bg-white block" />
          <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl">Trocar</button>
            <button type="button" onClick={() => onChange('', '')}
              className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl">Remover</button>
          </div>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl p-8 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
          style={{ borderColor: '#c8e6c9', background: '#f1f8f1', maxWidth: 240 }}>
          <svg className="w-8 h-8" style={{ color: '#4CAF50' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs font-semibold text-center" style={{ color: '#2E7D32' }}>Clique para enviar</p>
          <p className="text-[10px] text-slate-400 text-center">800×1000px · JPG, PNG, WebP · Máx 10MB</p>
        </div>
      )}

      {uploading && (
        <div className="mt-2 max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3.5 h-3.5 animate-spin" style={{ color: '#4CAF50' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span className="text-xs text-slate-500">Enviando... {progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: '#4CAF50' }} />
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />

      {value && (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="mt-2 text-xs font-medium underline" style={{ color: '#2E7D32' }}>
          Trocar imagem
        </button>
      )}
    </div>
  )
}
