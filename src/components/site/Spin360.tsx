import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCw, Loader2, MousePointer2 } from "lucide-react";

const FRAME_COUNT = 48; // cadre extrase din video (mod fallback)
const CAPTURE_WIDTH = 1000;

type Props = {
  /** Cadre pre-extrase (mod rapid, recomandat). */
  frames?: string[] | null;
  /** Video 360° din care se extrag cadrele la deschidere (fallback). */
  videoUrl?: string | null;
  title?: string;
};

type Frame = CanvasImageSource & { width: number; height: number };

/**
 * Vizualizator 360°: rotire interactivă cu mouse-ul / degetul.
 * - Dacă are `frames`, le încarcă direct (instant, fluid pe orice telefon).
 * - Altfel extrage cadre din `videoUrl`.
 */
export function Spin360({ frames, videoUrl, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<Frame[]>([]);
  const bitmapsRef = useRef<ImageBitmap[]>([]);
  const indexRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const movedRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  const draw = useCallback((i: number) => {
    const canvas = canvasRef.current;
    const fr = framesRef.current;
    if (!canvas || fr.length === 0) return;
    const img = fr[((i % fr.length) + fr.length) % fr.length];
    const ctx = canvas.getContext("2d");
    if (!ctx || !img) return;
    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width;
      canvas.height = img.height;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, []);

  // ---- Mod cadre pre-extrase (preferat) ----
  useEffect(() => {
    if (!frames || frames.length === 0) return;
    let cancelled = false;
    let loaded = 0;
    const imgs: HTMLImageElement[] = [];

    frames.forEach((src, idx) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (cancelled) return;
        loaded += 1;
        setProgress(Math.round((loaded / frames.length) * 100));
        if (loaded === frames.length) {
          framesRef.current = imgs as unknown as Frame[];
          setReady(true);
          requestAnimationFrame(() => draw(0));
        }
      };
      img.onerror = () => {
        if (!cancelled) setFailed(true);
      };
      img.src = src;
      imgs[idx] = img;
    });

    return () => {
      cancelled = true;
      framesRef.current = [];
    };
  }, [frames, draw]);

  // ---- Mod extragere din video (fallback) ----
  useEffect(() => {
    if (frames && frames.length > 0) return;
    if (!videoUrl) return;
    let cancelled = false;
    const video = document.createElement("video");
    video.muted = true;
    (video as HTMLVideoElement).defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.preload = "auto";
    video.style.cssText =
      "position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none;";
    document.body.appendChild(video);
    video.src = videoUrl;
    video.load();

    const capture = document.createElement("canvas");
    const cctx = capture.getContext("2d");

    const seek = (t: number) =>
      new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          video.removeEventListener("seeked", onSeeked);
          reject(new Error("seek timeout"));
        }, 8000);
        const onSeeked = () => {
          clearTimeout(timer);
          video.removeEventListener("seeked", onSeeked);
          resolve();
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = t;
      });

    const run = async () => {
      try {
        await new Promise<void>((resolve, reject) => {
          if (video.readyState >= 1) return resolve();
          const to = setTimeout(() => reject(new Error("metadata timeout")), 15000);
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
              reject(new Error("video error"));
            },
            { once: true },
          );
        });
        const duration = video.duration;
        if (!isFinite(duration) || duration <= 0) throw new Error("durată invalidă");

        const ratio = (video.videoHeight || 1080) / (video.videoWidth || 1920);
        capture.width = CAPTURE_WIDTH;
        capture.height = Math.round(CAPTURE_WIDTH * ratio);

        const bitmaps: ImageBitmap[] = [];
        for (let i = 0; i < FRAME_COUNT; i++) {
          if (cancelled) return;
          const t = (duration * i) / FRAME_COUNT;
          await seek(Math.min(t, duration - 0.001));
          if (!cctx) throw new Error("fără context canvas");
          cctx.drawImage(video, 0, 0, capture.width, capture.height);
          const bmp = await createImageBitmap(capture);
          bitmaps.push(bmp);
          if (!cancelled) setProgress(Math.round(((i + 1) / FRAME_COUNT) * 100));
        }
        if (cancelled) {
          bitmaps.forEach((b) => b.close());
          return;
        }
        bitmapsRef.current = bitmaps;
        framesRef.current = bitmaps as unknown as Frame[];
        setReady(true);
        requestAnimationFrame(() => draw(0));
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    run();

    return () => {
      cancelled = true;
      bitmapsRef.current.forEach((b) => b.close());
      bitmapsRef.current = [];
      framesRef.current = [];
      video.removeAttribute("src");
      video.load();
      video.remove();
    };
  }, [frames, videoUrl, draw]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!ready) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    draggingRef.current = true;
    movedRef.current = false;
    lastXRef.current = e.clientX;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !ready) return;
    const dx = e.clientX - lastXRef.current;
    if (Math.abs(dx) < 3) return;
    lastXRef.current = e.clientX;
    if (!movedRef.current) {
      movedRef.current = true;
      setHintVisible(false);
    }
    const width = canvasRef.current?.clientWidth || 600;
    const count = framesRef.current.length || FRAME_COUNT;
    const step = (dx / width) * count;
    indexRef.current += step;
    draw(Math.round(indexRef.current));
  };

  const onPointerUp = () => {
    draggingRef.current = false;
  };

  if (failed) {
    if (videoUrl) {
      return (
        <video
          controls
          playsInline
          className="max-h-[70vh] w-auto rounded-xl bg-black"
          src={videoUrl}
        />
      );
    }
    return (
      <p className="rounded-xl bg-black/60 px-6 py-8 text-center text-sm text-white">
        Nu s-a putut încărca vizualizarea 360°.
      </p>
    );
  }

  return (
    <div className="relative w-full max-w-3xl">
      <div className="relative overflow-hidden rounded-xl bg-black">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="mx-auto block max-h-[70vh] w-full touch-none select-none"
          style={{ cursor: ready ? "grab" : "default", aspectRatio: "16 / 9" }}
          aria-label={title ? `Vizualizare 360° ${title}` : "Vizualizare 360°"}
        />

        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Se pregătește vizualizarea 360°… {progress}%</p>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {ready && hintVisible && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <MousePointer2 className="h-4 w-4" />
              Trage pentru a roti poarta
            </span>
          </div>
        )}
      </div>

      {ready && (
        <p className="mt-3 flex items-center justify-center gap-2 text-center text-sm text-white/70">
          <RotateCw className="h-4 w-4" /> Rotește 360° cu mouse-ul sau degetul
        </p>
      )}
    </div>
  );
}
