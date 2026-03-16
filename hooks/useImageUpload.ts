'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseImageUploadOptions {
  folder?: string
  onSuccess?: (url: string, path: string) => void
}

export function useImageUpload({ folder = 'misc', onSuccess }: UseImageUploadOptions = {}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  async function upload(file: File): Promise<{ url: string; path: string } | null> {
    if (!file) return null

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Máximo 5MB.')
      return null
    }

    setUploading(true)
    setProgress(10)

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      setProgress(40)

      const { data, error } = await supabase.storage
        .from('store-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) throw error

      setProgress(80)

      const { data: urlData } = supabase.storage
        .from('store-images')
        .getPublicUrl(data.path)

      setProgress(100)

      const result = { url: urlData.publicUrl, path: data.path }
      onSuccess?.(result.url, result.path)
      return result
    } catch (err: any) {
      console.error('Erro no upload:', err)
      alert('Erro ao fazer upload: ' + err.message)
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 500)
    }
  }

  async function remove(path: string): Promise<boolean> {
    const { error } = await supabase.storage.from('store-images').remove([path])
    return !error
  }

  return { upload, remove, uploading, progress }
}
