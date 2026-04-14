import type { ProductSort } from "../types/admin"

type AdminProductFiltersProps = {
  searchQuery: string
  setSearchQuery: (value: string) => void

  selectedCategoryLabel: string
  selectedSubcategoryLabel: string
  selectedSortLabel: string

  isCategoryOpen: boolean
  setIsCategoryOpen: (value: boolean | ((current: boolean) => boolean)) => void

  isSubcategoryOpen: boolean
  setIsSubcategoryOpen: (value: boolean | ((current: boolean) => boolean)) => void

  isSortOpen: boolean
  setIsSortOpen: (value: boolean | ((current: boolean) => boolean)) => void

  availableCategories: string[]
  availableSubcategories: string[]

  setSelectedCategory: (value: string) => void
  setSelectedSubcategory: (value: string) => void
  setProductSort: (value: ProductSort) => void

  filteredCount: number
  totalCount: number
}

export function AdminProductFilters({
  searchQuery,
  setSearchQuery,

  selectedCategoryLabel,
  selectedSubcategoryLabel,
  selectedSortLabel,

  isCategoryOpen,
  setIsCategoryOpen,

  isSubcategoryOpen,
  setIsSubcategoryOpen,

  isSortOpen,
  setIsSortOpen,

  availableCategories,
  availableSubcategories,

  setSelectedCategory,
  setSelectedSubcategory,
  setProductSort,

  filteredCount,
  totalCount,
}: AdminProductFiltersProps) {
  return (
    <>
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

            {availableSubcategories.map((subcategory) => (
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
        Найдено товаров: {filteredCount} из {totalCount}
      </div>
    </>
  )
}
