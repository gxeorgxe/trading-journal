import { supabase } from '../lib/supabase'

const BUCKET = 'screenshots'

/** Convert a base64 data URL to a Blob */
function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const bytes = atob(parts[1])
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

/** Check if a string is a base64 data URL (not an http URL) */
export function isBase64(str: string): boolean {
  return str.startsWith('data:')
}

/**
 * Upload a screenshot (base64 or File) to Supabase Storage.
 * Returns the public URL.
 */
export async function uploadScreenshot(
  source: string | File,
  tradeId: string,
  userId: string
): Promise<string> {
  const fileName = `${crypto.randomUUID()}.jpg`
  const path = `${userId}/${tradeId}/${fileName}`

  let body: Blob | File
  if (typeof source === 'string') {
    body = base64ToBlob(source)
  } else {
    body = source
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, { contentType: 'image/jpeg', upsert: false })

  if (error) throw new Error(`Screenshot upload failed: ${error.message}`)

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path)

  return urlData.publicUrl
}

/**
 * Upload multiple screenshots, converting base64 to Storage URLs.
 * Already-URL screenshots are passed through unchanged.
 */
export async function uploadScreenshots(
  screenshots: string[],
  tradeId: string,
  userId: string
): Promise<string[]> {
  return Promise.all(
    screenshots.map(async (s) => {
      if (isBase64(s)) {
        return uploadScreenshot(s, tradeId, userId)
      }
      return s // already a URL
    })
  )
}

/** Delete all screenshots for a trade from Storage */
export async function deleteTradeScreenshots(tradeId: string, userId: string): Promise<void> {
  const folder = `${userId}/${tradeId}`
  const { data: files } = await supabase.storage.from(BUCKET).list(folder)

  if (files && files.length > 0) {
    const paths = files.map(f => `${folder}/${f.name}`)
    await supabase.storage.from(BUCKET).remove(paths)
  }
}
