"use client";

import { useState, useEffect, useCallback } from "react";
import AssetGrid from "@/components/gallery/AssetGrid";
import FilterBar from "@/components/gallery/FilterBar";
import SearchBar from "@/components/gallery/SearchBar";
import type { Asset, Category } from "@/types";

export default function GalleryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "12");
    if (selectedCategory) params.set("category", selectedCategory);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/assets?${params}`);
      const data = await res.json();
      setAssets(data.assets);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
    setLoading(false);
  }, [page, selectedCategory, search]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategory(slug);
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-2">Gallery</h1>
      <p className="text-gray-400 mb-8">Browse all 3D assets</p>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-800 rounded-xl" />
              <div className="mt-3 h-4 bg-gray-800 rounded w-3/4" />
              <div className="mt-2 h-3 bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <AssetGrid assets={assets} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
