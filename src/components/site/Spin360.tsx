import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCw, Loader2, MousePointer2 } from "lucide-react";

const FRAME_COUNT = 48; // cadre extrase pentru o rotație completă
const CAPTURE_WIDTH = 960; // lățimea la care capturăm cadrele (echilibru calitate/memorie)

type Props = {
  videoUrl: string;
  title?: string;
};

/**
 * Vizualizator 360°: încarcă un clip în care obiectul se rotește complet,
 * extrage cadre uniform distribuite și permite rotirea cu mouse-ul / degetul.
 * Dacă extragerea eșuează (CORS etc.), afișează clipul video ca fallback.
 */
export function Spin360({ videoUrl, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
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
    const frames = framesRef.current;
    if (!canvas || frames.length === 0) return;
    const bmp = frames[((i % frames.length) + frames.length) % frames.length];
    const ctx = canvas.getContext("2d");
    if (!ctx || !bmp) return;
    if (canvas.width !== bmp.width || canvas.height !== bmp.height) {
      canvas.width = bmp.width;
      canvas.height = bmp.height;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const video = document.createElement("video");
    video.muted = true;
    (video as HTMLVideoElement).defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.preload = "auto";
    // atașăm ascuns în DOM — unele browsere (iOS Safari) nu redau/seek corect
    // un element video detașat.
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
        // evităm ultimul cadru identic cu primul (buclă) folosind duration * i/FRAME_COUNT
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
        framesRef.current = bitmaps;
        setReady(true);
        requestAnimationFrame(() => draw(0));
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    run();

    return () => {
      cancelled = true;
      framesRef.current.forEach((b) => b.close());
      framesRef.current = [];
      video.removeAttribute("src");
      video.load();
      video.remove();
    };
  }, [videoUrl, draw]);

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
    // o lățime completă de drag = o rotație completă
    const step = (dx / width) * FRAME_COUNT;
    indexRef.current += step;
    draw(Math.round(indexRef.current));
  };

  const onPointerUp = () => {
    draggingRef.current = false;
  };

  if (failed) {
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
