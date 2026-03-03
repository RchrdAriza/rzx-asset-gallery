"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AssetCard from "@/components/gallery/AssetCard";
import type { Collection } from "@/types";

export default function CollectionDetailPage() {
  const params = useParams();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.slug) return;
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data: Collection[]) => {
        const found = data.find((c) => c.slug === params.slug);
        setCollection(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-800 rounded-xl mb-8" />
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-white">Collection not found</h1>
        <Link href="/collections" className="mt-4 inline-block text-purple-400 hover:text-purple-300">
          ← Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden mb-10">
        {collection.coverUrl ? (
          <div className="relative h-64">
            <Image
              src={collection.coverUrl}
              alt={collection.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
            <div className="absolute bottom-0 left-0 p-8">
              <Link href="/collections" className="text-purple-400 hover:text-purple-300 text-sm mb-2 block">
                ← Collections
              </Link>
              <h1 className="text-4xl font-bold text-white">{collection.name}</h1>
              <p className="text-gray-300 mt-2">{collection.description}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-white/10 rounded-xl p-8">
            <Link href="/collections" className="text-purple-400 hover:text-purple-300 text-sm mb-2 block">
              ← Collections
            </Link>
            <h1 className="text-4xl font-bold text-white">{collection.name}</h1>
            <p className="text-gray-400 mt-2">{collection.description}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <p className="text-gray-400 text-sm mb-6">
        {(collection.assets ?? []).length} asset{(collection.assets ?? []).length !== 1 ? "s" : ""} in this collection
      </p>

      {/* Assets grid */}
      {(collection.assets ?? []).length === 0 ? (
        <div className="text-center py-16 text-gray-500">No assets in this collection yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(collection.assets ?? []).map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
