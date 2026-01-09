import { createClient } from '@/utils/supabase/client'

/**
 * Uploads an image file to Supabase Storage with client-side compression.
 * @param {File} file - The file object from input.
 * @param {string} bucket - The bucket name (default 'images').
 * @returns {Promise<string>} - The public URL of the uploaded image.
 */
export async function uploadImage(file, bucket = 'images') {
    if (!file) return null

    // 1. Compress Image
    const compressedFile = await compressImage(file)

    // 2. Upload to Supabase
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressedFile, {
            upsert: false,
            contentType: 'image/jpeg' // We convert all to JPEG for consistency
        })

    if (error) {
        console.error('Upload Error:', error)
        throw error
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

    return publicUrl
}

/**
 * Compresses an image using HTML Canvas.
 * Max width: 1200px, Quality: 0.7 (JPEG)
 */
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target.result
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const MAX_WIDTH = 1200
                const scaleSize = MAX_WIDTH / img.width
                const width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width
                const height = (img.width > MAX_WIDTH) ? img.height * scaleSize : img.height

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'))
                        return
                    }
                    // Create a new File object with the same name but forced jpg extension if preferred, 
                    // or keep original name but change content.
                    // Actually, let's return Blob directly or File. 
                    // Supabase upload accepts Blob.
                    resolve(blob)
                }, 'image/jpeg', 0.7) // Quality 0.7 is good balance
            }
            img.onerror = (err) => reject(err)
        }
        reader.onerror = (err) => reject(err)
    })
}
