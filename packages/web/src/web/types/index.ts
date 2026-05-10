export interface Location {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  imageUrl: string | null;
}

export interface Product {
  id: number;
  name: string;
  modelNo: string;
  categoryId: number;
  price: number;
  lumen: number | null;
  colorTemp: string | null;
  ipRating: string | null;
  style: string | null;
  watt: number | null;
  imageUrl: string | null;
  catalogPage: number | null;
  description: string | null;
  features: string | null;
  beamAngle: number | null;
  reachDistance: number | null;
  category: Category;
}

export interface EstimateItem {
  productId: number;
  quantity: number;
}
