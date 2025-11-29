// components/admin/ImageUploader.tsx
"use client";

import { useCallback, useState, DragEvent, ChangeEvent } from "react";

type ImageUploaderProps = {
    label?: string;
    value: string;
    onChange: (url: string) => void;
    error?: string;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

const MAX_SIZE_MB = 8;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUploader({
    label = "Imagen del producto",
    value,
    onChange,
    error,
}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        await uploadAndSetUrl(file);
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await uploadAndSetUrl(file);
    };

    const uploadAndSetUrl = useCallback(
        async (file: File) => {
            if (file.size > MAX_SIZE_BYTES) {
                alert(
                    `La imagen es muy pesada (${(file.size / 1024 / 1024).toFixed(
                        1
                    )} MB). El máximo permitido es ${MAX_SIZE_MB} MB.`
                );
                return;
            }

            if (!CLOUD_NAME || !UPLOAD_PRESET) {
                console.error(
                    "Faltan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME o NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"
                );
                alert(
                    "Falta configuración de Cloudinary en el servidor. Contacta al administrador."
                );
                return;
            }

            try {
                setIsUploading(true);

                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", UPLOAD_PRESET);

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!res.ok) {
                    let msg = "No se pudo subir la imagen. Intenta con otra o más liviana.";

                    try {
                        const errJson = await res.json();
                        console.error("❌ Error Cloudinary:", errJson);
                        if (errJson?.error?.message) {
                            msg = `No se pudo subir la imagen: ${errJson.error.message}`;
                        }
                    } catch (parseErr) {
                        const txt = await res.text().catch(() => "");
                        console.error("❌ Error Cloudinary (texto):", txt);
                    }

                    alert(msg);
                    return;
                }

                const data = await res.json();
                const url = data.secure_url as string;
                onChange(url);
            } catch (err) {
                console.error("🔥 Error upload:", err);
                alert("Ocurrió un error subiendo la imagen.");
            } finally {
                setIsUploading(false);
            }
        },
        [onChange]
    );

    return (
        <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
                {label} *
            </label>

            <div
                className={`relative border-2 border-dashed rounded-xl px-4 py-4 text-xs
          ${isDragging
                        ? "border-pink-400 bg-pink-50/50"
                        : "border-slate-200 bg-slate-50/60"
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                        {value ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={value}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[24px]">
                                📷
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-xs">
                            {isUploading
                                ? "Subiendo imagen..."
                                : "Arrastra una imagen aquí o toca para seleccionarla"}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Formatos: JPG/PNG. Tamaño máximo {MAX_SIZE_MB} MB.
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            <label className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
                                Elegir archivo
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>

                            <span className="text-[10px] text-slate-400">
                                En móvil se abre la galería o cámara.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <input
                type="text"
                placeholder="/images/productos/mi-detalle.jpg o https://..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 text-xs"
            />

            {error && (
                <p className="text-[11px] text-red-500 mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
