export type AdminSectionId = "overview" | "products" | "categories" | "orders" | "settings"

export type AdminSection = {
  id: AdminSectionId
  label: string
  note: string
}

export type AdminMetric = {
  label: string
  value: string
  hint: string
}

export type AdminProductRow = {
  id: string
  name: string
  cost: number | null
  category: string
  subcategory: string
  desc: string
  pic: string[]
  price: string
  status: "published" | "draft"
}

export type AdminApiProduct = {
  id: string
  name: string
  cost: number | null
  category: string
  subcategory: string
  pic: string[]
  desc: string
  status: "published" | "draft"
}

export type AdminInvalidProduct = {
  id: string
  source_file: string
  name: string
  category: string
  subcategory: string
  issues: string[]
}

export type AdminProductsResponse = {
  count: number
  products: AdminApiProduct[]
  invalidCount: number
  invalidProducts: AdminInvalidProduct[]
  message?: string
}

export type AdminCatalogSubcategoryOption = {
  subcategoryId: string
  subcategory: string
}

export type AdminCatalogCategoryOption = {
  categoryId: string
  category: string
  subcategories: AdminCatalogSubcategoryOption[]
}

export type AdminCatalogOptionsResponse = {
  categories?: AdminCatalogCategoryOption[]
  message?: string
}

export type AdminUploadResponse = {
  imagePath?: string
  message?: string
}

export type RequestStatus = "idle" | "loading" | "success" | "error"

export type ProductSort = "name-asc" | "price-asc" | "price-desc"
