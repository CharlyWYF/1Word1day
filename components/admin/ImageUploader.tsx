"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export default function ImageUploader({
  currentImageUrl,
  onUpload,
  onRemove,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("图片不能超过 5MB");
      return;
    }

    // Show local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "上传失败");
      }

      const data = await res.json();
      onUpload(data.url);
    } catch (err: any) {
      setError(err.message || "上传失败");
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        配图
      </label>

      {preview ? (
        <div className="relative">
          <div className="glass rounded-xl p-2">
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={250}
              className="w-full h-48 object-contain rounded-lg"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 text-xs rounded-xl glass-button disabled:opacity-50"
            >
              {uploading ? "上传中..." : "更换图片"}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 text-xs rounded-xl bg-red-400/20 border border-red-300/30 text-red-600 hover:bg-red-400/30 transition-all"
            >
              移除
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="glass rounded-xl p-8 text-center cursor-pointer hover:bg-white/25 transition-all"
        >
          <p className="text-gray-400 text-sm">
            {uploading ? "上传中..." : "点击选择图片"}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            支持 JPG、PNG、WebP，最大 5MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
