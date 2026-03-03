"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Collection } from "@/types";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        setCollections(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white">Collections</h1>
        <p className="text-gray-400 mt-2">Curated packs of 3D assets</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-800 rounded-xl h-64" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          No collections yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative rounded-xl overflow-hidden bg-gray-900 border border-white/10 hover:border-purple-500/50 transition-colors"
            >
              {/* Cover */}
              <div className="relative h-48 bg-gray-800">
                {col.coverUrl ? (
                  <Image
                    src={col.coverUrl}
                    alt={col.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                )}
                {/* Asset count badge */}
                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  {(col.assets ?? []).length} asset{(col.assets ?? []).length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                  {col.name}
                </h2>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{col.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
