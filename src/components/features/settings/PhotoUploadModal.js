"use client";

import { 
  Camera, 
  X, 
  Upload, 
  Move, 
  CheckCircle 
} from "lucide-react";

export default function PhotoUploadModal({
  isPhotoModalOpen,
  setIsPhotoModalOpen,
  stopCamera,
  sourceImage,
  setSourceImage,
  cameraActive,
  fileInputRef,
  handleFileSelect,
  startCamera,
  videoRef,
  capturePhoto,
  panX,
  panY,
  zoom,
  setZoom,
  isDragging,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleTouchStart,
  handleTouchMove,
  handleCropSave,
  setPanX,
  setPanY
}) {
  if (!isPhotoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 flex flex-col items-center">
        {/* Modal Header */}
        <div className="flex justify-between items-center w-full border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Camera className="h-4 w-4 text-[#0D9488]" />
            Atur Foto Profil
          </h3>
          <button
            onClick={() => {
              setIsPhotoModalOpen(false);
              stopCamera();
            }}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content Mode Selection */}
        {!sourceImage && !cameraActive && (
          <div className="flex flex-col gap-3 w-full py-8">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/50 text-[#0D9488] font-bold hover:bg-teal-50 transition text-xs cursor-pointer"
            >
              <Upload className="h-5 w-5 text-[#0D9488]" />
              Pilih File Foto
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={startCamera}
              className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition text-xs cursor-pointer shadow-2xs"
            >
              <Camera className="h-5 w-5 text-slate-500" />
              Ambil dengan Kamera
            </button>
          </div>
        )}

        {/* Webcam Stream */}
        {cameraActive && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative h-60 w-60 rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-inner">
              <video
                ref={videoRef}
                className="h-full w-full object-cover scale-x-[-1]"
                playsInline
                muted
              />
            </div>
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs transition cursor-pointer"
              >
                Ambil Foto
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Cropper Adjuster */}
        {sourceImage && (
          <div className="flex flex-col items-center gap-4 w-full">
            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Move className="h-3.5 w-3.5 text-slate-400 animate-pulse" /> Geser foto dan gunakan slider untuk zoom
            </p>

            {/* Crop Box Container */}
            <div 
              className="relative h-60 w-60 rounded-full overflow-hidden bg-slate-100 border border-slate-300 shadow-inner cursor-move select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              <img
                src={sourceImage}
                alt="Cropping source"
                draggable={false}
                className="absolute max-w-none origin-center pointer-events-none"
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain"
                }}
              />
              {/* Circular Crop Overlay Finder */}
              <div className="absolute inset-0 border-[20px] border-slate-900/60 pointer-events-none">
                <div className="h-full w-full rounded-full border border-white/50 border-dashed" />
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="w-full space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Zoom Out</span>
                <span>Zoom In</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
              />
            </div>

            <div className="flex gap-2 w-full pt-2">
              <button
                type="button"
                onClick={handleCropSave}
                className="flex-1 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="h-4 w-4" /> Simpan Foto
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceImage(null);
                  setZoom(1);
                  setPanX(0);
                  setPanY(0);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Kembali
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
