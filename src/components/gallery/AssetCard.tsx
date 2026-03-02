import Link from "next/link";
import Image from "next/image";
import type { Asset } from "@/types";

interface AssetCardProps {
  asset: Asset;
}

export default function AssetCard({ asset }: AssetCardProps) {
  return (
    <Link href={`/asset/${asset.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gray-900/50 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
        {/* Thumbnail */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={asset.thumbnailUrl}
            alt={asset.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {asset.featured && (
            <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-white font-medium truncate">{asset.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
              {asset.category.name}
            </span>
            <span className="text-xs text-gray-500 uppercase">{asset.format}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{(asset.fileSize / 1024 / 1024).toFixed(1)} MB</span>
            <span>{asset.downloads} downloads</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
