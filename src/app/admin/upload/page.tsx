"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/types";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    tags: "",
    featured: false,
  });
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!session) {
    router.push("/admin");
    return null;
  }

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.trim() }),
    });
    const cat = await res.json();
    setCategories([...categories, cat]);
    setForm({ ...form, categoryId: cat.id });
    setNewCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelFile || !thumbnailFile) {
      alert("Please select both a 3D model file and a thumbnail image.");
      return;
    }

    setUploading(true);

    try {
      // Upload model
      const modelFormData = new FormData();
      modelFormData.append("file", modelFile);
      modelFormData.append("type", "model");
      const modelRes = await fetch("/api/upload", { method: "POST", body: modelFormData });
      const modelData = await modelRes.json();

      // Upload thumbnail
      const thumbFormData = new FormData();
      thumbFormData.append("file", thumbnailFile);
      thumbFormData.append("type", "thumbnail");
      const thumbRes = await fetch("/api/upload", { method: "POST", body: thumbFormData });
      const thumbData = await thumbRes.json();

      // Get file extension
      const format = modelFile.name.split(".").pop()?.toLowerCase() || "glb";

      // Create asset
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          categoryId: form.categoryId,
          tags,
          modelUrl: modelData.url,
          thumbnailUrl: thumbData.url,
          format,
          fileSize: modelData.bytes,
          featured: form.featured,
        }),
      });

      router.push("/admin");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload asset. Please try again.");
    }

    setUploading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Upload Asset</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
            placeholder="My 3D Model"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 resize-none"
            placeholder="Describe your 3D model..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <div className="flex gap-2">
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
            placeholder="character, low-poly, game-ready"
          />
        </div>

        {/* 3D Model File */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">3D Model File (.glb, .gltf)</label>
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors">
            <input
              type="file"
              accept=".glb,.gltf,.fbx,.obj"
              onChange={(e) => setModelFile(e.target.files?.[0] || null)}
              className="hidden"
              id="model-file"
            />
            <label htmlFor="model-file" className="cursor-pointer">
              {modelFile ? (
                <p className="text-purple-400">{modelFile.name} ({(modelFile.size / 1024 / 1024).toFixed(1)} MB)</p>
              ) : (
                <>
                  <svg className="w-10 h-10 mx-auto text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-400">Click to upload 3D model</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail Image</label>
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="hidden"
              id="thumb-file"
            />
            <label htmlFor="thumb-file" className="cursor-pointer">
              {thumbnailFile ? (
                <p className="text-purple-400">{thumbnailFile.name}</p>
              ) : (
                <>
                  <svg className="w-10 h-10 mx-auto text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400">Click to upload thumbnail</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Featured */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="featured"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="w-4 h-4 bg-gray-800 border-white/10 rounded text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="featured" className="text-sm text-gray-300">
            Featured asset (shown on homepage)
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {uploading ? "Uploading..." : "Upload Asset"}
        </button>
      </form>
    </div>
  );
}
