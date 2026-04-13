import { type FormEvent, useEffect, useRef, useState } from "react"
import "../../Styles/Admin.css"

const API_BASE = "http://localhost:5000/api"

type AdminSectionId = "overview" | "products" | "categories" | "orders" | "settings"

type AdminSection = {
  id: AdminSectionId
  label: string
  note: string
}

type AdminMetric = {
  label: string
  value: string
  hint: string
}

type AdminProductRow = {
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

type AdminApiProduct = {
  id: string
  name: string
  cost: number | null
  category: string
  subcategory: string
  pic: string[]
  desc: string
  status: "published" | "draft"
}

type AdminInvalidProduct = {
  id: string
  source_file: string
  name: string
  category: string
  subcategory: string
  issues: string[]
}

type AdminProductsResponse = {
  count: number
  products: AdminApiProduct[]
  invalidCount: number
  invalidProducts: AdminInvalidProduct[]
  message?: string
}

type AdminCatalogSubcategoryOption = {
  subcategoryId: string
  subcategory: string
}

type AdminCatalogCategoryOption = {
  categoryId: string
  category: string
  subcategories: AdminCatalogSubcategoryOption[]
}

type AdminCatalogOptionsResponse = {
  categories?: AdminCatalogCategoryOption[]
  message?: string
}

type AdminUploadResponse = {
  imagePath?: string
  message?: string
}

type RequestStatus = "idle" | "loading" | "success" | "error"

type ProductSort = "name-asc" | "price-asc" | "price-desc"

const adminSections: AdminSection[] = [
  { id: "overview", label: "Обзор", note: "Статус админки и быстрые действия" },
  { id: "products", label: "Товары", note: "Будущий CRUD каталога" },
  { id: "categories", label: "Категории", note: "Структура каталога" },
  { id: "orders", label: "Заказы", note: "Когда появится checkout" },
  { id: "settings", label: "Настройки", note: "Служебные параметры проекта" },
]

const adminMetrics: AdminMetric[] = [
  { label: "Каталог", value: "Под контролем", hint: "Основные витринные страницы уже собраны" },
  { label: "Корзина", value: "Готова", hint: "Есть контекст, страница и badge" },
  { label: "TypeScript", value: "Переведен", hint: "Основной frontend уже на TS" },
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

  const editFormRef = useRef<HTMLFormElement | null>(null)




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
        setIsEditCategoryOpen(false)
        setIsEditSubcategoryOpen(false)

        requestAnimationFrame(() => {
          editFormRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
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
        setIsEditCategoryOpen(false)
        setIsEditSubcategoryOpen(false)
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


          cancelEditProduct()
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
            <section className="admin-grid">
              <div className="admin-metrics">
                {adminMetrics.map((metric) => (
                  <article key={metric.label} className="admin-card admin-metric">
                    <div className="admin-metric__label">{metric.label}</div>
                    <div className="admin-metric__value">{metric.value}</div>
                    <div className="admin-metric__hint">{metric.hint}</div>
                  </article>
                ))}
              </div>

              <div className="admin-card admin-panel">
                <div className="admin-panel__header">
                  <h3 className="admin-panel__title">Что должно быть в MVP админки</h3>
                </div>

                <div className="admin-checklist">
                  <div className="admin-checklist__item">
                    1. Список товаров с кнопками редактирования
                  </div>
                  <div className="admin-checklist__item">
                    2. Форма создания и обновления товара
                  </div>
                  <div className="admin-checklist__item">
                    3. Работа с категориями и подкатегориями
                  </div>
                  <div className="admin-checklist__item">
                    4. Базовый список заказов, когда появится checkout
                  </div>
                </div>
              </div>

              <div className="admin-card admin-panel">
                <div className="admin-panel__header">
                  <h3 className="admin-panel__title">Почему такой формат правильный</h3>
                </div>

                <p className="admin-panel__text">
                  У тебя сейчас нет полноценного admin CRUD API, поэтому лучший шаг
                  не городить сложную систему, а собрать хороший интерфейсный каркас,
                  в который потом спокойно встроятся реальные данные.
                </p>
              </div>
            </section>
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

              <div className="admin-filters">
                <input
                  className="admin-filters__input"
                  type="text"
                  placeholder="Поиск по названию"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />

                <div className={`admin-dropdown ${isCategoryOpen ? "admin-dropdown--open" : ""}`}>
                  <button
                    type="button"
                    className="admin-dropdown__button"
                    onClick={() => {
                      setIsCategoryOpen((current) => !current)
                      setIsSubcategoryOpen(false)
                      setIsSortOpen(false)
                    }}
                  >
                    <span>{selectedCategoryLabel}</span>
                    <span>v</span>
                  </button>

                  <ul className="admin-dropdown__list">
                    <li>
                      <button
                        type="button"
                        className="admin-dropdown__option"
                        onClick={() => {
                          setSelectedCategory("all")
                          setIsCategoryOpen(false)
                        }}
                      >
                        Все категории
                      </button>
                    </li>

                    {availableCategories.map((category) => (
                      <li key={category}>
                        <button
                          type="button"
                          className="admin-dropdown__option"
                          onClick={() => {
                            setSelectedCategory(category)
                            setIsCategoryOpen(false)
                          }}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`admin-dropdown ${isSubcategoryOpen ? "admin-dropdown--open" : ""}`}>
                  <button
                    type="button"
                    className="admin-dropdown__button"
                    onClick={() => {
                      setIsSubcategoryOpen((current) => !current)
                      setIsCategoryOpen(false)
                      setIsSortOpen(false)
                    }}
                  >
                    <span>{selectedSubcategoryLabel}</span>
                    <span>v</span>
                  </button>

                  <ul className="admin-dropdown__list">
                    <li>
                      <button
                        type="button"
                        className="admin-dropdown__option"
                        onClick={() => {
                          setSelectedSubcategory("all")
                          setIsSubcategoryOpen(false)
                        }}
                      >
                        Все подкатегории
                      </button>
                    </li>

                    {availaSubcategories.map((subcategory) => (
                      <li key={subcategory}>
                        <button
                          type="button"
                          className="admin-dropdown__option"
                          onClick={() => {
                            setSelectedSubcategory(subcategory)
                            setIsSubcategoryOpen(false)
                          }}
                        >
                          {subcategory}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`admin-dropdown ${isSortOpen ? "admin-dropdown--open" : ""}`}>
                  <button
                    type="button"
                    className="admin-dropdown__button"
                    onClick={() => {
                      setIsSortOpen((current) => !current)
                      setIsCategoryOpen(false)
                      setIsSubcategoryOpen(false)
                    }}
                  >
                    <span>{selectedSortLabel}</span>
                    <span>v</span>
                  </button>

                  <ul className="admin-dropdown__list">
                    <li>
                      <button
                        type="button"
                        className="admin-dropdown__option"
                        onClick={() => {
                          setProductSort("name-asc")
                          setIsSortOpen(false)
                        }}
                      >
                        По имени А-Я
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        className="admin-dropdown__option"
                        onClick={() => {
                          setProductSort("price-asc")
                          setIsSortOpen(false)
                        }}
                      >
                        Сначала дешевле
                      </button>
                    </li>

                    <li>
                      <button
                        type="button"
                        className="admin-dropdown__option"
                        onClick={() => {
                          setProductSort("price-desc")
                          setIsSortOpen(false)
                        }}
                      >
                        Сначала дороже
                      </button>
                    </li>
                  </ul>
                </div>

              </div>

              <div className="admin-filters__meta">
                Найдено товаров: {filteredRows.length} из {productRows.length}
              </div>

              {editingProductId || isCreatingProduct ? (
                <form
                  ref={editFormRef}
                  className="admin-edit-form"
                  onSubmit={(event) => void saveProduct(event)}
                >
                  <div className="admin-edit-form__header">
                    <div>
                      <h4 className="admin-edit-form__title">
                        {isCreatingProduct ? "Добавление товара" : "Редактирование товара"}
                      </h4>
                      <p className="admin-edit-form__text">
                        Изменения сохраняются отдельно, исходный cards.jsonl не трогаем.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="admin-row__btn admin-row__btn--ghost"
                      onClick={cancelEditProduct}
                      disabled={isSavingProduct}
                    >
                      Закрыть
                    </button>
                  </div>

                  <label className="admin-edit-form__field">
                    <span>Название</span>
                    <input
                      type="text"
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                    />
                  </label>

                  <label className="admin-edit-form__field">
                    <span>Цена</span>
                    <input
                      type="number"
                      min="0"
                      value={editCost}
                      onChange={(event) => setEditCost(event.target.value)}
                      placeholder="Цена позже"
                    />
                  </label>

                  <label className="admin-edit-form__field">
                    <span>Категория</span>
                    <div className={`admin-dropdown ${isEditCategoryOpen ? "admin-dropdown--open" : ""}`}>
                      <button
                        type="button"
                        className="admin-dropdown__button"
                        onClick={() => {
                          setIsEditCategoryOpen((current) => !current)
                          setIsEditSubcategoryOpen(false)
                        }}
                        aria-expanded={isEditCategoryOpen}
                      >
                        <span>{editCategoryLabel}</span>
                        <span>v</span>
                      </button>

                      <ul className="admin-dropdown__list">
                        {editCategory ? (
                          <li>
                            <button
                              type="button"
                              className="admin-dropdown__option admin-dropdown__option--reset"
                              onClick={() => {
                                setEditCategory("")
                                setEditSubcategory("")
                                setIsEditCategoryOpen(false)
                                setIsEditSubcategoryOpen(false)
                              }}
                            >
                              Сбросить выбор
                            </button>
                          </li>
                        ) : null}

                        {categoryOptions.map((category) => (
                          <li key={category}>
                            <button
                              type="button"
                              className="admin-dropdown__option"
                              onClick={() => {
                                setEditCategory(category)
                                setEditSubcategory("")
                                setIsEditCategoryOpen(false)
                                setIsEditSubcategoryOpen(false)
                              }}
                            >
                              {category}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </label>

                  <label className="admin-edit-form__field">
                    <span>Подкатегория</span>
                    <div className={`admin-dropdown ${isEditSubcategoryOpen ? "admin-dropdown--open" : ""}`}>
                      <button
                        type="button"
                        className="admin-dropdown__button"
                        onClick={() => {
                          if (!editCategory) return

                          setIsEditSubcategoryOpen((current) => !current)
                          setIsEditCategoryOpen(false)
                        }}
                        disabled={!editCategory}
                        aria-expanded={isEditSubcategoryOpen}
                      >
                        <span>{editSubcategoryLabel}</span>
                        <span>v</span>
                      </button>

                      <ul className="admin-dropdown__list">
                        {editSubcategory ? (
                          <li>
                            <button
                              type="button"
                              className="admin-dropdown__option admin-dropdown__option--reset"
                              onClick={() => {
                                setEditSubcategory("")
                                setIsEditSubcategoryOpen(false)
                              }}
                            >
                              Сбросить выбор
                            </button>
                          </li>
                        ) : null}

                        {subcategoryOptions.map((subcategory) => (
                          <li key={subcategory}>
                            <button
                              type="button"
                              className="admin-dropdown__option"
                              onClick={() => {
                                setEditSubcategory(subcategory)
                                setIsEditSubcategoryOpen(false)
                              }}
                            >
                              {subcategory}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </label>

                  <label className="admin-edit-form__field admin-edit-form__field--wide">
                    <span>Описание</span>
                    <textarea
                      value={editDesc}
                      onChange={(event) => setEditDesc(event.target.value)}
                      placeholder="Кратко опиши товар"
                    />
                  </label>

                  <div className="admin-edit-form__field admin-edit-form__field--wide">
                    <span>Изображение</span>

                    <div className="admin-file-input">
                      <input
                        id="admin-image-upload"
                        className="admin-file-input__native"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null
                          setSelectedImageFile(file)
                        }}
                      />

                      <label htmlFor="admin-image-upload" className="admin-file-input__label">
                        <span className="admin-file-input__button">
                          {selectedImageFile ? "Выбрать другое" : "Выбрать файл"}
                        </span>

                        <span className="admin-file-input__name">
                          {selectedImageFile
                            ? selectedImageFile.name
                            : editPic[0]
                              ? "Текущее изображение загружено"
                              : "PNG, JPG или WEBP до 5 МБ"}
                        </span>
                      </label>
                    </div>

                  {previewImageUrl ? (
                    <div className="admin-edit-form__preview">
                      <img src={previewImageUrl} alt="Превью товара" />
                    </div>
                  ) : null}
                </div>


                  <div className="admin-edit-form__actions">
                    <button
                      type="submit"
                      className="admin-panel__action"
                      disabled={isSavingProduct}
                    >
                      {isSavingProduct
                        ? "Сохраняем..."
                        : isCreatingProduct
                          ? "Создать"
                          : "Сохранить"}
                    </button>

                    <button
                      type="button"
                      className="admin-row__btn admin-row__btn--ghost"
                      onClick={cancelEditProduct}
                      disabled={isSavingProduct}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
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
