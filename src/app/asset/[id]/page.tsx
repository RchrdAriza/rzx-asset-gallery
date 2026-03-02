"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import ViewerControls from "@/components/viewer/ViewerControls";
import type { Asset } from "@/types";

const ModelViewer = dynamic(() => import("@/components/viewer/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-950 rounded-xl flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Loading 3D viewer...</div>
    </div>
  ),
});

export default function AssetDetailPage() {
  const params = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    fetch(`/api/assets/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setAsset(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleDownload = async () => {
    if (!asset) return;
    // Increment download count
    fetch(`/api/assets/${asset.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ downloads: asset.downloads + 1 }),
    });

    // Trigger download
    const link = document.createElement("a");
    link.href = asset.modelUrl;
    link.download = `${asset.name}.${asset.format}`;
    link.click();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-[500px] bg-gray-800 rounded-xl" />
          <div className="mt-6 h-8 bg-gray-800 rounded w-1/3" />
          <div className="mt-4 h-4 bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-white">Asset not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 3D Viewer */}
      <div className="relative rounded-xl overflow-hidden">
        <ModelViewer modelUrl={asset.modelUrl} wireframe={wireframe} showGrid={showGrid} />
        <ViewerControls
          wireframe={wireframe}
          showGrid={showGrid}
          onToggleWireframe={() => setWireframe(!wireframe)}
          onToggleGrid={() => setShowGrid(!showGrid)}
        />
      </div>

      {/* Asset Info */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-white">{asset.name}</h1>
          <p className="mt-4 text-gray-400 leading-relaxed">{asset.description}</p>

          {/* Tags */}
          {asset.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {asset.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6 space-y-4">
          <button
            onClick={handleDownload}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Free
          </button>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Category</span>
              <span className="text-purple-400">{asset.category.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Format</span>
              <span className="text-white uppercase">{asset.format}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Size</span>
              <span className="text-white">{(asset.fileSize / 1024 / 1024).toFixed(1)} MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Downloads</span>
              <span className="text-white">{asset.downloads}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Added</span>
              <span className="text-white">{new Date(asset.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
