import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCw, Loader2, MousePointer2, ZoomIn, ZoomOut, Maximize2, Maximize, Minimize } from "lucide-react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

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
  const lastYRef = useRef(0);
  const movedRef = useRef(false);

  // zoom / pan
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef(0);
  const pinchStartScaleRef = useRef(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const onChange = () => {
      const active = document.fullscreenElement === wrapRef.current;
      setIsFullscreen(active);
      requestAnimationFrame(() => applyTransformRef.current());
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.();
    }
  }, []);

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const applyTransform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = scaleRef.current;
    let { x, y } = offsetRef.current;
    // limitează panoramarea la marginile imaginii
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const maxX = (w * (s - 1)) / 2;
    const maxY = (h * (s - 1)) / 2;
    x = clamp(x, -maxX, maxX);
    y = clamp(y, -maxY, maxY);
    offsetRef.current = { x, y };
    canvas.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
  }, []);
  const applyTransformRef = useRef(applyTransform);
  applyTransformRef.current = applyTransform;

  const setZoom = useCallback(
    (next: number) => {
      const s = clamp(next, MIN_SCALE, MAX_SCALE);
      scaleRef.current = s;
      if (s === 1) offsetRef.current = { x: 0, y: 0 };
      setScale(s);
      applyTransform();
    },
    [applyTransform],
  );

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

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!ready) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      const [p1, p2] = [...pointersRef.current.values()];
      pinchStartDistRef.current = dist(p1, p2);
      pinchStartScaleRef.current = scaleRef.current;
      draggingRef.current = false;
      return;
    }
    draggingRef.current = true;
    movedRef.current = false;
    lastXRef.current = e.clientX;
    lastYRef.current = e.clientY;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!ready) return;
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // pinch-to-zoom (2 degete)
    if (pointersRef.current.size === 2) {
      const [p1, p2] = [...pointersRef.current.values()];
      const d = dist(p1, p2);
      if (pinchStartDistRef.current > 0) {
        setZoom((pinchStartScaleRef.current * d) / pinchStartDistRef.current);
      }
      return;
    }

    if (!draggingRef.current) return;

    // panoramare când e mărit
    if (scaleRef.current > 1) {
      const dx = e.clientX - lastXRef.current;
      const dy = e.clientY - lastYRef.current;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;
      offsetRef.current = {
        x: offsetRef.current.x + dx,
        y: offsetRef.current.y + dy,
      };
      applyTransform();
      return;
    }

    // rotire 360°
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

  const onPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchStartDistRef.current = 0;
    if (pointersRef.current.size === 0) draggingRef.current = false;
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!ready) return;
    setZoom(scaleRef.current - Math.sign(e.deltaY) * 0.3);
  };

  const onDoubleClick = () => {
    if (!ready) return;
    setZoom(scaleRef.current > 1 ? 1 : 2);
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
      <div ref={wrapRef} className="relative overflow-hidden rounded-xl bg-black">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          onDoubleClick={onDoubleClick}
          className="mx-auto block max-h-[70vh] w-full touch-none select-none"
          style={{
            cursor: ready ? (scale > 1 ? "grab" : "ew-resize") : "default",
            aspectRatio: "16 / 9",
            transformOrigin: "center center",
            willChange: "transform",
          }}
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

        {ready && (
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Ieși din ecran complet" : "Ecran complet"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-black/90"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setZoom(scaleRef.current + 0.5)}
              disabled={scale >= MAX_SCALE}
              aria-label="Mărește"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-black/90 disabled:opacity-40"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(scaleRef.current - 0.5)}
              disabled={scale <= MIN_SCALE}
              aria-label="Micșorează"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-black/90 disabled:opacity-40"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            {scale > 1 && (
              <button
                type="button"
                onClick={() => setZoom(1)}
                aria-label="Resetează zoom"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-black/90"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {ready && hintVisible && scale === 1 && (
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
          <RotateCw className="h-4 w-4" />
          {scale > 1 ? "Trage pentru a te deplasa · dublu-clic pentru zoom" : "Rotește 360° · scroll / pinch pentru zoom"}
        </p>
      )}

    </div>
  );
}
