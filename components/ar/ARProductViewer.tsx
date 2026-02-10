"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDeviceCamera } from "@/hooks/useDeviceCamera";

interface ARProductViewerProps {
  productImage: string;
  productName: string;
  onClose: () => void;
}

export default function ARProductViewer({
  productImage,
  productName,
  onClose,
}: ARProductViewerProps) {
  const { videoRef, isActive, error: cameraError, startCamera, stopCamera } = useDeviceCamera();

  // Product position & transform
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Drag state
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 0, y: 0 });

  // Pinch state
  const lastPinchDistance = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const productImgRef = useRef<HTMLImageElement>(null);

  // Init camera on mount
  useEffect(() => {
    startCamera();
    // Center product
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setPosition({ x: centerX, y: centerY });

    const timer = setTimeout(() => setShowInstructions(false), 3000);
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- DRAG (mouse + touch) ---
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e as unknown as TouchEvent).touches?.length > 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    positionStart.current = { ...position };
    setShowInstructions(false);
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({
      x: positionStart.current.x + dx,
      y: positionStart.current.y + dy,
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // --- PINCH TO ZOOM (touch) ---
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (lastPinchDistance.current > 0) {
        const delta = dist / lastPinchDistance.current;
        setScale((prev) => Math.min(3, Math.max(0.3, prev * delta)));
      }
      lastPinchDistance.current = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastPinchDistance.current = 0;
  }, []);

  // --- CONTROLS ---
  const handleScaleUp = () => setScale((s) => Math.min(3, s + 0.15));
  const handleScaleDown = () => setScale((s) => Math.max(0.3, s - 0.15));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  // --- CAPTURE ---
  const handleCapture = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const productImg = productImgRef.current;
    if (!canvas || !productImg) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * 2;
    canvas.height = h * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(2, 2);

    // Draw camera feed or gradient background
    if (video && isActive && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, w, h);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, "#fce7f3");
      gradient.addColorStop(1, "#e9d5ff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    // Draw product image
    const imgSize = 200 * scale;
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(productImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
    ctx.restore();

    // Watermark
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Dulces Detalles ER", 16, h - 16);

    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    setIsCaptured(true);
  }, [isActive, position, scale, rotation, videoRef]);

  // --- SHARE ---
  const handleShare = useCallback(async () => {
    if (!capturedImage) return;

    try {
      const blob = await (await fetch(capturedImage)).blob();
      const file = new File([blob], `dulces-detalles-ar-${Date.now()}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${productName} - Dulces Detalles ER`,
          text: `Mira como se ve este detalle de Dulces Detalles ER: ${productName}`,
          files: [file],
        });
      } else {
        // Fallback: download
        const a = document.createElement("a");
        a.href = capturedImage;
        a.download = `dulces-detalles-ar-${Date.now()}.png`;
        a.click();
      }
    } catch {
      // User cancelled share
    }
  }, [capturedImage, productName]);

  const handleRetake = () => {
    setIsCaptured(false);
    setCapturedImage(null);
  };

  // --- CAPTURED VIEW ---
  if (isCaptured && capturedImage) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <img src={capturedImage} alt="Captura AR" className="max-w-full max-h-full object-contain" />
        </div>
        <div className="flex items-center justify-center gap-4 p-4 bg-black/80">
          <button
            onClick={handleRetake}
            className="px-5 py-2.5 rounded-full bg-white/20 text-white text-sm font-semibold"
          >
            Volver
          </button>
          <button
            onClick={handleShare}
            className="px-5 py-2.5 rounded-full bg-pink-500 text-white text-sm font-semibold shadow-lg inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Compartir
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN AR VIEW ---
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black touch-none select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient fallback when no camera */}
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100" />
      )}

      {/* Camera error message */}
      {cameraError && (
        <div className="absolute top-20 left-4 right-4 bg-amber-500/90 text-white text-xs font-semibold px-4 py-2 rounded-xl text-center">
          {cameraError} — Puedes seguir usando la vista con fondo de color
        </div>
      )}

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 text-white text-sm font-semibold px-6 py-3 rounded-2xl animate-pulse">
            Arrastra el producto para colocarlo
          </div>
        </div>
      )}

      {/* Product image (draggable) */}
      <div
        className="absolute cursor-grab active:cursor-grabbing"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
          transition: isDragging.current ? "none" : "transform 0.1s ease",
        }}
        onPointerDown={handlePointerDown}
      >
        <img
          ref={productImgRef}
          src={productImage}
          alt={productName}
          crossOrigin="anonymous"
          className="w-[200px] h-[200px] object-contain drop-shadow-2xl pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent px-4 pt-3 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-pink-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">AR</span>
            <span className="text-white text-sm font-semibold truncate max-w-[200px]">{productName}</span>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-8">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleScaleDown}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold"
          >
            -
          </button>
          <button
            onClick={handleRotate}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
            title="Rotar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Capture button */}
          <button
            onClick={handleCapture}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-pink-400"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500" />
          </button>

          <button
            onClick={handleScaleUp}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold"
          >
            +
          </button>

          <div className="w-10" /> {/* Spacer for symmetry */}
        </div>
        <p className="text-center text-white/60 text-[10px] mt-2">
          {Math.round(scale * 100)}% &middot; Toca la imagen para mover
        </p>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
