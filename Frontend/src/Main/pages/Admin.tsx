import { type FormEvent, useEffect, useRef, useState } from "react"
import type {
  AdminApiProduct,
  AdminCatalogCategoryOption,
  AdminCatalogOptionsResponse,
  AdminInvalidProduct,
  AdminProductRow,
  AdminProductsResponse,
  AdminSection,
  AdminSectionId,
  AdminUploadResponse,
  ProductSort,
  RequestStatus,
} from "../types/admin"
import { AdminProductForm } from "../features/AdminProductForm"
import { AdminProductFilters } from "../features/AdminProductFilters"
import { AdminOverview } from "../features/AdminOverview"

import "../../Styles/Admin.css"

const API_BASE = "http://localhost:5000/api"

const adminSections: AdminSection[] = [
  { id: "overview", label: "Обзор", note: "Статус админки и быстрые действия" },
  { id: "products", label: "Товары", note: "Будущий CRUD каталога" },
  { id: "categories", label: "Категории", note: "Структура каталога" },
  { id: "orders", label: "Заказы", note: "Когда появится checkout" },
  { id: "settings", label: "Настройки", note: "Служебные параметры проекта" },
]

function Admin() {
  const [activeSection, setActiveSection] = useState<AdminSectionId>("overview")
  const [pingStatus, setPingStatus] = useState<"loading" | "ok" | "error">("loading")

  /*api admin константы*/

  const [products, setProducts] = useState<AdminApiProduct[]>([])
  const [productStatus, setProductStatus] = useState<RequestStatus>("idle")
  const [productsError, setProductsError] = useState("")
  const [invalidProducts, setInvalidProducts] = useState<AdminInvalidProduct[]>([])

  const [catalogOptions, setCatalogOptions] = useState<AdminCatalogCategoryOption[]>([])
  const [catalogOptionsError, setCatalogOptionsError] = useState("")

  /*sorts admin константы*/
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSubcategory, setSelectedSubcategory] = useState("all")
  const [productSort, setProductSort] = useState<ProductSort>("name-asc")

  /* константы списка*/
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  /*константы крада*/
  
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [editName, setEditName] = useState("")
  const [editCost, setEditCost] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editSubcategory, setEditSubcategory] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editPic, setEditPic] = useState<string[]>([])
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [isEditSubcategoryOpen, setIsEditSubcategoryOpen] = useState(false)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [productActionError, setProductActionError] = useState("")
  const [productActionSuccess, setProductActionSuccess] = useState("")

  const editFormRef = useRef<HTMLFormElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)




  useEffect(() => {
    let cancelled = false

    async function pingAdmin() {
      try {
        const res = await fetch(`${API_BASE}/admin/ping`, {
          credentials: "include",
        })

        if (!res.ok) {
          throw new Error("Admin ping failed")
        }

        if (!cancelled) {
          setPingStatus("ok")
        }
      } catch {
        if (!cancelled) {
          setPingStatus("error")
        }
      }
    }

    void pingAdmin()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      setProductStatus("loading")
      setProductsError("")

      try {
        const res = await fetch(`${API_BASE}/admin/products`, {
          credentials: "include",
        })

        const data = (await res.json().catch(() => ({}))) as Partial<AdminProductsResponse>

        if (!res.ok) {
          const message =
            typeof data.message === "string" ? data.message : "Не удалось загрузить товары"
          throw new Error(message)  
        }

        if (cancelled) return

        setProducts(Array.isArray(data.products) ? data.products : [])
        setInvalidProducts(Array.isArray(data.invalidProducts) ? data.invalidProducts : [])
        setProductStatus("success")
      } catch (error) {
        if (cancelled) return

        setProducts([])
        setInvalidProducts([])
        setProductStatus("error")
        setProductsError(
          error instanceof Error ? error.message : "Не удалось загрузить товары"
        )
      }
    }

    void loadProduct()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadCatalogOptions() {
      setCatalogOptionsError("")

      try {
        const res = await fetch(`${API_BASE}/admin/catalog-options`, {
          credentials: "include"
        })

        const data = (await res.json().catch(() => ({}))) as Partial<AdminCatalogOptionsResponse>

        if (!res.ok) {
          const message =
            typeof data.message === "string"
              ? data.message
              : "Не удалось загрузить структуру каталога"

          throw new Error(message)    
        }

        if (cancelled) return

        setCatalogOptions(Array.isArray(data.categories) ? data.categories : [])
      } catch (error) {
        if (cancelled) return

        setCatalogOptions([])
        setCatalogOptionsError(
          error instanceof Error ? error.message : "Не удалось загрузить структуру каталога"
        )
      }
    }

    void loadCatalogOptions()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedImageFile) {
      const objectUrl = URL.createObjectURL(selectedImageFile)
      setPreviewImageUrl(objectUrl)

      return () => {
        URL.revokeObjectURL(objectUrl)
      }
    }

    if (editPic[0]) {
      setPreviewImageUrl(`http://localhost:5000${editPic[0]}`)
      return
    }

    setPreviewImageUrl("")
  }, [selectedImageFile, editPic])

  useEffect(() => {
    setSelectedSubcategory("all")
  }, [selectedCategory])

  const activeSectionMeta =
    adminSections.find((section) => section.id === activeSection) || adminSections[0]

    const productRows: AdminProductRow[] = products.map((product) => ({
      id: product.id,
      name: product.name,
      cost: product.cost,
      category: product.category,
      subcategory: product.subcategory,
      desc: product.desc || "",
      pic: product.pic || [],
      price: product.cost != null ? `${product.cost} ₽` : "Цена позже",
      status: product.status,
    }))

    function formatIssue(issue: string) {
      if (issue === "missing_name") return "нет имени"
      if (issue === "missing_category") return "нет категории"
      if (issue === "missing_subcategory") return "нет подкатегории"
      if (issue === "json_decode_failed") return "ошибка разбора json"
      return issue
    }

    const availableCategories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "ru"))

    const availaSubcategories = Array.from(
      new Set(
        products
          .filter((product) =>
            selectedCategory === "all" ? true : product.category === selectedCategory
          )
          .map((product) => product.subcategory)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "ru"))

    const selectedCategoryLabel =
      selectedCategory === "all" ? "Все категории" : selectedCategory

    const selectedSubcategoryLabel =
      selectedSubcategory === "all" ? "Все подкатегории" : selectedSubcategory
      
    const selectedSortLabel =
      productSort === "name-asc"
        ? "По имени А-Я"
        : productSort === "price-asc"
          ? "Сначала дешевле"
          : "Сначала дороже"

    const selectedCategoryOption =
      catalogOptions.find((option) => option.category === editCategory) || null
      
    const categoryOptions = catalogOptions.map((option) => option.category)
    
    const subcategoryOptions = selectedCategoryOption
      ? selectedCategoryOption.subcategories.map((option) => option.subcategory)
      : []

    const editCategoryLabel = editCategory || "Выберите категорию"

    const editSubcategoryLabel = editSubcategory
      ? editSubcategory
      : editCategory
        ? "Выберите подкатегорию"
        : "Сначала выберите категорию"

    const filteredRows = productRows
      .filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
        
        const matchesCategory =
          selectedCategory === "all" ? true: product.category === selectedCategory
          
        const matchesSubcategory =
          selectedSubcategory === "all"
            ? true
            : product.subcategory === selectedSubcategory
           
        return matchesSearch && matchesCategory && matchesSubcategory    
      })
      .sort((a, b) => {
        if (productSort === "name-asc") {
          return a.name.localeCompare(b.name, "ru")
        }

        const priceA = a.price === "Цена позже" ? Number.POSITIVE_INFINITY : Number(a.price.replace(/[^\d]/g, ""))
        const priceB = b.price === "Цена позже" ? Number.POSITIVE_INFINITY : Number(b.price.replace(/[^\d]/g, ""))

        if (productSort === "price-asc") {
          return priceA - priceB
        }

        return priceB - priceA
      })

    const totalProductsCount = productRows.length

    const totalCategoriesCount = catalogOptions.length

    const totalSubcategoriesCount = catalogOptions.reduce(
      (count, category) => count + category.subcategories.length,
      0
    )

    const productsWithoutPriceCount = productRows.filter(
      (product) => product.cost == null
    ).length

    const productsWithoutImageCount = productRows.filter(
      (product) => product.pic.length === 0
    ).length

      function startCreateProduct() {
        setIsCreatingProduct(true)
        setEditingProductId(null)
        setEditName("")
        setEditCost("")
        setEditCategory(selectedCategory === "all" ? "" : selectedCategory)
        setEditSubcategory(selectedSubcategory === "all" ? "" : selectedSubcategory)
        setEditDesc("")
        setEditPic([])
        setSelectedImageFile(null)
        setProductActionError("")
        setProductActionSuccess("")
        setIsEditCategoryOpen(false)
        setIsEditSubcategoryOpen(false)

        requestAnimationFrame(() => {
          editFormRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        })
      }

      function openCreateProductFromOverview() {
        setActiveSection("products")

        requestAnimationFrame(() => {
          startCreateProduct()
        })
      }

      function startEditProduct(product: AdminProductRow) {
        setIsCreatingProduct(false)
        setEditingProductId(product.id)
        setEditName(product.name)
        setEditCost(product.cost != null ? String(product.cost) : "")
        setEditCategory(product.category)
        setEditSubcategory(product.subcategory)
        setEditDesc(product.desc || "")
        setEditPic(product.pic || [])
        setSelectedImageFile(null)
        setProductActionError("")
        setProductActionSuccess("")
        setIsEditCategoryOpen(false)
        setIsEditSubcategoryOpen(false)

        requestAnimationFrame(() => {
          editFormRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        })
      }

      function cancelEditProduct() {
        setIsCreatingProduct(false)
        setEditingProductId(null)
        setEditName("")
        setEditCost("")
        setEditCategory("")
        setEditSubcategory("")
        setEditDesc("")
        setEditPic([])
        setSelectedImageFile(null)
        setProductActionError("")
        setProductActionSuccess("")
        setIsEditCategoryOpen(false)
        setIsEditSubcategoryOpen(false)
      }

      function clearSelectedImageFile() {
        setSelectedImageFile(null)

        if (imageInputRef.current) {
          imageInputRef.current.value = ""
        }
      }

      function removeProductImage() {
        const confirmed = window.confirm("Удалить текущее изображение у товара?")

        if (!confirmed) return

        clearSelectedImageFile()
        setEditPic([])
        setProductActionSuccess("")
      }

      async function uploadImage() {
        if (!selectedImageFile) {
          return editPic
        }

        setIsUploadingImage(true)

        try {
          const formData = new FormData()
          formData.append("image", selectedImageFile)

          const res = await fetch(`${API_BASE}/admin/upload`, {
            method: "POST",
            credentials: "include",
            body: formData,
          })

          const data = (await res.json().catch(() => ({}))) as AdminUploadResponse

          if (!res.ok || !data.imagePath) {
            throw new Error(data.message || "Не удалось загрузить изображение")
          }

          const nextPic = [data.imagePath]

          setEditPic(nextPic)
          setSelectedImageFile(null)

          return nextPic
        } finally {
          setIsUploadingImage(false)
        }
      }

      async function saveProduct(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!editingProductId && !isCreatingProduct) return

        setIsSavingProduct(true)
        setProductActionError("")

        try {
          const nextPic = await uploadImage()

          const requestUrl = isCreatingProduct
            ? `${API_BASE}/admin/products`
            : `${API_BASE}/admin/products/${editingProductId}`

          const requestMethod = isCreatingProduct ? "POST" : "PUT"
          
      
          const res = await fetch(requestUrl, {
            method: requestMethod,
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: editName,
              cost: editCost,
              category: editCategory,
              subcategory: editSubcategory,
              desc: editDesc,
              pic: nextPic,
            }),
          })

          const data = (await res.json().catch(() => ({}))) as {
            product?: AdminApiProduct
            message?: string
          }

          if (!res.ok || !data.product) {
            throw new Error(data.message || "Не удалось сохранить товар")
          }

          const updatedProduct = data.product

          setProducts((currentProducts) =>
            isCreatingProduct
              ? [updatedProduct, ...currentProducts]
              : currentProducts.map((product) =>
                  product.id === updatedProduct.id ? updatedProduct : product
                )
          )


          const successMessage = isCreatingProduct
            ? "Товар создан"
            : "Изменения товара сохранены"

          cancelEditProduct()
          setProductActionSuccess(successMessage)  
        } catch (error) {
          setProductActionError(
            error instanceof Error ? error.message : "Не удалось сохранить товар"
          )
        } finally {
          setIsSavingProduct(false)
        }
      }

      async function deleteProduct(product: AdminProductRow) {
        const confirmed = window.confirm(`Удалить товар "${product.name}"?`)

        if (!confirmed) return

        setDeletingProductId(product.id)
        setProductActionError("")
        setProductActionSuccess("")


        try {
          const res = await fetch(`${API_BASE}/admin/products/${product.id}`, {
            method: "DELETE",
            credentials: "include",
          })

          const data = (await res.json().catch(() => ({}))) as {
            message?: string
          }

          if (!res.ok) {
            throw new Error(data.message || "Не удалось удалить товар")
          }

          setProducts((currentProducts) =>
            currentProducts.filter((item) => item.id !== product.id)
          )

          if (editingProductId === product.id) {
            cancelEditProduct()
          }

          setProductActionSuccess(`Товар "${product.name}" удален`)
        } catch (error) {
          setProductActionError(
            error instanceof Error ? error.message : "Не удалось удалить товар"
          )
        } finally {
          setDeletingProductId(null)
        }
      }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__top">
            <div className="admin-sidebar__eyebrow">Tea Admin</div>
            <h1 className="admin-sidebar__title">Панель управления</h1>
            <p className="admin-sidebar__text">
              Простой управляющий слой для каталога, заказов и служебных настроек.
            </p>
          </div>

          <nav className="admin-nav">
            {adminSections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`admin-nav__item ${
                  activeSection === section.id ? "admin-nav__item--active" : ""
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="admin-nav__label">{section.label}</span>
                <span className="admin-nav__note">{section.note}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          <section className="admin-hero">
            <div>
              <div className="admin-hero__eyebrow">Раздел</div>
              <h2 className="admin-hero__title">{activeSectionMeta.label}</h2>
              <p className="admin-hero__text">{activeSectionMeta.note}</p>
            </div>

            <div className="admin-hero__right">
              <div
                className={`admin-status admin-status--${pingStatus}`}
                aria-live="polite"
              >
                {pingStatus === "loading" ? "Проверяем backend" : null}
                {pingStatus === "ok" ? "Backend админки доступен" : null}
                {pingStatus === "error" ? "Backend админки не отвечает" : null}
              </div>

              <button
                type="button"
                className="admin-hero__action"
                onClick={() => setActiveSection("products")}
              >
                К товарам
              </button>
            </div>
          </section>

          {activeSection === "overview" ? (
            <AdminOverview
              pingStatus={pingStatus}
              productStatus={productStatus}
              productsError={productsError}
              catalogOptionsError={catalogOptionsError}
              totalProducts={totalProductsCount}
              totalCategories={totalCategoriesCount}
              totalSubcategories={totalSubcategoriesCount}
              invalidCount={invalidProducts.length}
              missingPriceCount={productsWithoutPriceCount}
              missingImageCount={productsWithoutImageCount}
              onOpenProducts={() => setActiveSection("products")}
              onCreateProduct={openCreateProductFromOverview}
            />
          ) : null}

          {activeSection === "products" ? (
            <section className="admin-card admin-panel">
              <div className="admin-panel__header">
                <div>
                  <h3 className="admin-panel__title">Товары</h3>
                  <p className="admin-panel__subtitle">
                    Уже збс воркабл
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-panel__action"
                  onClick={startCreateProduct}
                >
                  Добавить товар
                </button>
              </div>

              <AdminProductFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategoryLabel={selectedCategoryLabel}
                selectedSubcategoryLabel={selectedSubcategoryLabel}
                selectedSortLabel={selectedSortLabel}
                isCategoryOpen={isCategoryOpen}
                setIsCategoryOpen={setIsCategoryOpen}
                isSubcategoryOpen={isSubcategoryOpen}
                setIsSubcategoryOpen={setIsSubcategoryOpen}
                isSortOpen={isSortOpen}
                setIsSortOpen={setIsSortOpen}
                availableCategories={availableCategories}
                availableSubcategories={availaSubcategories}
                setSelectedCategory={setSelectedCategory}
                setSelectedSubcategory={setSelectedSubcategory}
                setProductSort={setProductSort}
                filteredCount={filteredRows.length}
                totalCount={productRows.length}
              />


              {editingProductId || isCreatingProduct ? (
                <AdminProductForm
                  editFormRef={editFormRef}
                  imageInputRef={imageInputRef}
                  isCreatingProduct={isCreatingProduct}
                  isSavingProduct={isSavingProduct}
                  editName={editName}
                  setEditName={setEditName}
                  editCost={editCost}
                  setEditCost={setEditCost}
                  editCategory={editCategory}
                  setEditCategory={setEditCategory}
                  editSubcategory={editSubcategory}
                  setEditSubcategory={setEditSubcategory}
                  editDesc={editDesc}
                  setEditDesc={setEditDesc}
                  editPic={editPic}
                  selectedImageFile={selectedImageFile}
                  previewImageUrl={previewImageUrl}
                  setSelectedImageFile={setSelectedImageFile}
                  clearSelectedImageFile={clearSelectedImageFile}
                  removeProductImage={removeProductImage}
                  cancelEditProduct={cancelEditProduct}
                  saveProduct={saveProduct}
                  isEditCategoryOpen={isEditCategoryOpen}
                  setIsEditCategoryOpen={setIsEditCategoryOpen}
                  isEditSubcategoryOpen={isEditSubcategoryOpen}
                  setIsEditSubcategoryOpen={setIsEditSubcategoryOpen}
                  categoryOptions={categoryOptions}
                  subcategoryOptions={subcategoryOptions}
                  editCategoryLabel={editCategoryLabel}
                  editSubcategoryLabel={editSubcategoryLabel}
                />
              ) : null}
              {productActionSuccess ? (
                <div className="admin-state admin-state--success">
                  {productActionSuccess}
                </div>
              ) : null}

              {productActionError ? (
                <div className="admin-state admin-state--error">{productActionError}</div>
              ) : null}


              <div className="admin-table">
                {productStatus === "loading" ? (
                  <div className="admin-state">Загружаем реальные товары из backend...</div>
                ) : null}

                {productStatus === "error" ? (
                  <div className="admin-state admin-state--error">{productsError}</div>
                ) : null}

                {productStatus === "success" && filteredRows.length === 0 ? (
                  <div className="admin-state admin-state--warning">
                    Найдено проблемных записей: {invalidProducts.length}. Они не попадают на витрину и показаны отдельно ниже.</div>
                ) : null}

                {productStatus === "success"
                  ? filteredRows.map((product) => (
                    <div key={product.id} className="admin-row">
                      <div className="admin-row__main">
                        <div className="admin-row__name">{product.name}</div>
                        <div className="admin-row__meta">
                          {product.category} / {product.subcategory}
                        </div>
                      </div>

                      <div className="admin-row__price">{product.price}</div>

                      <div className={`admin-badge admin-badge--${product.status}`}>
                        {product.status === "published" ? "Опубликован" : "Черновик"}
                      </div>

                      <div className="admin-row__actions">
                        <button
                          type="button"
                          className="admin-row__btn"
                          onClick={() => startEditProduct(product)}
                        >
                          Редактировать  
                        </button>

                        <button
                          type="button"
                          className="admin-row__btn admin-row__btn--danger"
                          disabled={deletingProductId === product.id}
                          onClick={() => void deleteProduct(product)}
                        >
                          {deletingProductId === product.id ? "Удаляем" : "Удалить"}  
                        </button>  
                      </div>
                    </div>
                  ))
                : null}

                {productStatus === "success" && invalidProducts.length > 0 ? (
                  <div className="admin-issues">
                    <h4 className="admin-issues__title">Проблемные записи импорта</h4>

                    <div className="admin-issues__list">
                      {invalidProducts.map((item) => (
                        <div key={item.id} className="admin-issue-row">
                          <div className="admin-issue-row__file">{item.source_file}</div>
                          <div className="admin-issue-row__meta">
                            {(item.name || "Без имени")} /{" "}
                            {item.issues.map(formatIssue).join(" / ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {activeSection === "categories" ? (
            <section className="admin-card admin-panel">
              <div className="admin-panel__header">
                <h3 className="admin-panel__title">Категории</h3>
              </div>

              <p className="admin-panel__text">
                Здесь логично будет сделать список категорий и подкатегорий, а потом
                добавить возможность быстро менять структуру каталога без правки кода.
              </p>
            </section>
          ) : null}

          {activeSection === "orders" ? (
            <section className="admin-card admin-panel">
              <div className="admin-panel__header">
                <h3 className="admin-panel__title">Заказы</h3>
              </div>

              <p className="admin-panel__text">
                Раздел имеет смысл наполнять только после того, как появится реальная
                логика оформления заказа. Сейчас достаточно оставить его как заранее
                подготовленную секцию.
              </p>
            </section>
          ) : null}

          {activeSection === "settings" ? (
            <section className="admin-card admin-panel">
              <div className="admin-panel__header">
                <h3 className="admin-panel__title">Настройки</h3>
              </div>

              <p className="admin-panel__text">
                Здесь позже можно хранить служебные параметры: валюту, плотность
                каталога, видимость блоков и другие настройки магазина.
              </p>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default Admin

