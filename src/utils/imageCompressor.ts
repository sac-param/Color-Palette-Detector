/**
 * Compresses a base64 image (either a raw file reader result or another URI)
 * down to a max width/height (default 200px) and outputs a low-size jpeg base64.
 * This guarantees we never run out of localStorage quota (5MB limit).
 */
export function compressImage(
  base64: string,
  maxWidth = 200,
  maxHeight = 200,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    // If it's already tiny, don't worry
    if (base64.length < 15000) {
      resolve(base64);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Apply scale constraint
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(base64);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      } catch (e) {
        console.warn("Compression failed, falling back to original", e);
        resolve(base64);
      }
    };

    img.onerror = () => {
      resolve(base64);
    };

    img.src = base64;
  });
}
