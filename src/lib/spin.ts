/**
 * Extrage cadre dintr-un fișier video (mp4/webm/mov) direct în browser.
 * Folosit la încărcarea în admin: în loc să stocăm un video greu (50MB+),
 * păstrăm câteva zeci de imagini mici pentru rotirea 360° — rapid și fluid
 * pe orice dispozitiv, fără decodare video la client.
 */

export type ExtractProgress = (done: number, total: number) => void;

/**
 * Punct de intrare: încearcă întâi decodarea nativă (rapidă), iar dacă browserul
 * nu suportă codecul (ex. .mov / HEVC de pe iPhone), trece pe ffmpeg.wasm.
 */
export async function extractSpinFrames(
  file: File,
  frameCount = 48,
  targetWidth = 1000,
  quality = 0.82,
  onProgress?: ExtractProgress,
): Promise<Blob[]> {
  try {
    return await extractSpinFramesNative(file, frameCount, targetWidth, quality, onProgress);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Codec neacceptat sau decodare eșuată → folosim ffmpeg.wasm (suportă orice format).
    if (msg === "UNSUPPORTED_CODEC" || msg === "Durată video invalidă." || msg === "Nu s-a putut citi videoul.") {
      return await extractSpinFramesFfmpeg(file, frameCount, targetWidth, quality, onProgress);
    }
    throw err;
  }
}

async function extractSpinFramesNative(
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

// ---- Fallback ffmpeg.wasm (decodează orice format, inclusiv HEVC/.mov) ----

let ffmpegPromise: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | null = null;

async function getFfmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return ffmpeg;
    })();
  }
  return ffmpegPromise;
}

async function extractSpinFramesFfmpeg(
  file: File,
  frameCount = 48,
  targetWidth = 1000,
  quality = 0.82,
  onProgress?: ExtractProgress,
): Promise<Blob[]> {
  const ffmpeg = await getFfmpeg();
  const inputName = "input" + (file.name.match(/\.[a-z0-9]+$/i)?.[0] || ".mp4");

  // Determină durata din log-urile ffmpeg.
  let duration = 0;
  const onLog = ({ message }: { message: string }) => {
    const m = message.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
    if (m) duration = (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]);
  };
  ffmpeg.on("log", onLog);

  try {
    const { fetchFile } = await import("@ffmpeg/util");
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Prima trecere: obține durata (comanda eșuează intenționat, dar loghează durata).
    try {
      await ffmpeg.exec(["-i", inputName]);
    } catch {
      /* așteptat: fără output */
    }

    const fps = duration > 0 ? frameCount / duration : 12;
    const q = Math.max(2, Math.round((1 - quality) * 30) + 2); // ffmpeg qscale 2 (best) .. ~10
    await ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      `fps=${fps.toFixed(4)},scale=${targetWidth}:-1:flags=lanczos`,
      "-q:v",
      String(q),
      "-frames:v",
      String(frameCount),
      "frame_%03d.jpg",
    ]);

    const blobs: Blob[] = [];
    for (let i = 1; i <= frameCount; i++) {
      const name = `frame_${String(i).padStart(3, "0")}.jpg`;
      try {
        const data = (await ffmpeg.readFile(name)) as Uint8Array;
        if (!data || data.length === 0) break;
        const buf = new Uint8Array(data);
        blobs.push(new Blob([buf], { type: "image/jpeg" }));
        onProgress?.(blobs.length, frameCount);
        await ffmpeg.deleteFile(name).catch(() => {});
      } catch {
        break;
      }
    }

    if (blobs.length === 0) throw new Error("Nu s-au putut extrage cadre din video.");
    return blobs;
  } finally {
    ffmpeg.off("log", onLog);
    await ffmpeg.deleteFile(inputName).catch(() => {});
  }
}

