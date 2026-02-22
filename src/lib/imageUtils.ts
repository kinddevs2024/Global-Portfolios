/**
 * Converts a File to base64 data URL, optionally resizing/compressing images
 * to reduce payload size and avoid API limits.
 */
export async function fileToDataUrl(file: File, options?: { maxSize?: number; maxWidth?: number; maxHeight?: number; quality?: number }): Promise<string> {
    const maxSize = options?.maxSize ?? 512;
    const maxWidth = options?.maxWidth ?? 512;
    const maxHeight = options?.maxHeight ?? 512;
    const quality = options?.quality ?? 0.85;

    if (!file.type.startsWith("image/")) {
        return readFileAsDataUrl(file);
    }

    return new Promise<string>((resolve, reject) => {
        const img = document.createElement("img");
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                readFileAsDataUrl(file).then(resolve).catch(reject);
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            try {
                let dataUrl = canvas.toDataURL("image/jpeg", quality);
                let q = quality;
                while (dataUrl.length > maxSize * 1024 && q > 0.3) {
                    q -= 0.1;
                    dataUrl = canvas.toDataURL("image/jpeg", q);
                }
                resolve(dataUrl);
            } catch {
                readFileAsDataUrl(file).then(resolve).catch(reject);
            }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
    });
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}
