"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Collection, Asset } from "@/types";

export default function AdminCollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", coverUrl: "" });
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      fetch("/api/collections").then((r) => r.json()).then((d) => Array.isArray(d) ? d : []),
      fetch("/api/assets?limit=200").then((r) => r.json()),
    ]).then(([cols, assetsData]) => {
      setCollections(cols);
      setAllAssets(assetsData.assets);
      setLoading(false);
    });
  }, [session]);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!session) { router.push("/admin"); return null; }

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", description: "", coverUrl: "" });
    setSelectedAssets([]);
    setShowForm(true);
  };

  const openEdit = (col: Collection) => {
    setEditingId(col.id);
    setForm({ name: col.name, description: col.description, coverUrl: col.coverUrl });
    setSelectedAssets(col.assets?.map((a) => a.id) ?? []);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { ...form, assetIds: selectedAssets };

    if (editingId) {
      const res = await fetch(`/api/collections/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      if (updated.id) setCollections(collections.map((c) => (c.id === editingId ? updated : c)));
    } else {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      if (created.id) setCollections([created, ...collections]);
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    setCollections(collections.filter((c) => c.id !== id));
  };

  const toggleAsset = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Collections</h1>
          <p className="text-gray-400 mt-1">Manage curated asset packs</p>
        </div>
        <button
          onClick={openCreate}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          + New Collection
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? "Edit Collection" : "New Collection"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Nature Pack"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="A collection of nature-themed 3D assets..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cover Image URL (optional)</label>
                <input
                  type="text"
                  value={form.coverUrl}
                  onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                  className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>

              {/* Asset selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assets ({selectedAssets.length} selected)
                </label>
                <div className="border border-white/10 rounded-lg max-h-60 overflow-y-auto divide-y divide-white/5">
                  {loading ? (
                    <p className="p-4 text-gray-400 text-sm">Loading assets...</p>
                  ) : allAssets.length === 0 ? (
                    <p className="p-4 text-gray-400 text-sm">No assets available.</p>
                  ) : (
                    allAssets.map((asset) => (
                      <label
                        key={asset.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(asset.id)}
                          onChange={() => toggleAsset(asset.id)}
                          className="w-4 h-4 rounded border-white/20 bg-gray-800 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-white text-sm flex-1">{asset.name}</span>
                        <span className="text-gray-500 text-xs uppercase">{asset.format}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collections table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Slug</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Assets</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => (
                <tr key={col.id ?? col.slug} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-white font-medium">{col.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{col.slug}</td>
                  <td className="px-6 py-4 text-gray-400">{(col.assets ?? []).length}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(col)}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-300 text-sm rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {collections.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No collections yet. Create your first one!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
