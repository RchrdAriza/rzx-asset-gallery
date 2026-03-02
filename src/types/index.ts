export interface Asset {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category: Category;
  tags: Tag[];
  modelUrl: string;
  thumbnailUrl: string;
  format: string;
  fileSize: number;
  downloads: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface AssetFormData {
  name: string;
  description: string;
  categoryId: string;
  tags: string[];
  featured: boolean;
  modelFile?: File;
  thumbnailFile?: File;
}
