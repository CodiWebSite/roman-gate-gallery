/**
 * Extrage cadre dintr-un fișier video (mp4/webm/mov) direct în browser.
 * Folosit la încărcarea în admin: în loc să stocăm un video greu (50MB+),
 * păstrăm câteva zeci de imagini mici pentru rotirea 360° — rapid și fluid
 * pe orice dispozitiv, fără decodare video la client.
 */

export type ExtractProgress = (done: number, total: number) => void;

export async function extractSpinFrames(
  file: File,
  frameCount = 48,
  targetWidth = 1000,
  quality = 0.82,
  onProgress?: ExtractProgress,
): Promise<Blob[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  (video as HTMLVideoElement).defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.preload = "auto";
  video.style.cssText =
    "position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none;";
  document.body.appendChild(video);
  video.load();

  const cleanup = () => {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
    video.remove();
  };

  try {
    await new Promise<void>((resolve, reject) => {
      if (video.readyState >= 1) return resolve();
      const to = setTimeout(() => reject(new Error("Nu s-a putut citi videoul.")), 20000);
      video.addEventListener(
        "loadedmetadata",
        () => {
          clearTimeout(to);
          resolve();
        },
        { once: true },
      );
      video.addEventListener(
        "error",
        () => {
          clearTimeout(to);
          reject(new Error("UNSUPPORTED_CODEC"));
        },
        { once: true },
      );
    });

    const duration = video.duration;
    if (!isFinite(duration) || duration <= 0) throw new Error("Durată video invalidă.");


    const ratio = (video.videoHeight || 1080) / (video.videoWidth || 1920);
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = Math.round(targetWidth * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponibil.");

    const seek = (t: number) =>
      new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          video.removeEventListener("seeked", onSeeked);
          reject(new Error("Extragerea cadrelor a expirat."));
        }, 10000);
        const onSeeked = () => {
          clearTimeout(timer);
          video.removeEventListener("seeked", onSeeked);
          resolve();
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = t;
      });

    const blobs: Blob[] = [];
    for (let i = 0; i < frameCount; i++) {
      const t = (duration * i) / frameCount;
      await seek(Math.min(t, duration - 0.001));
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), "image/jpeg", quality),
      );
      if (!blob) throw new Error("Nu s-a putut genera cadrul.");
      blobs.push(blob);
      onProgress?.(i + 1, frameCount);
    }
    return blobs;
  } finally {
    cleanup();
  }
}
