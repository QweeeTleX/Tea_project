import type { FormEvent, RefObject } from "react"

type AdminProductFormProps = {
  editFormRef: RefObject<HTMLFormElement | null>
  imageInputRef: RefObject<HTMLInputElement | null>
  isCreatingProduct: boolean
  isSavingProduct: boolean

  editName: string
  setEditName: (value: string) => void

  editCost: string
  setEditCost: (value: string) => void

  editCategory: string
  setEditCategory: (value: string) => void

  editSubcategory: string
  setEditSubcategory: (value: string) => void

  editDesc: string
  setEditDesc: (value: string) => void

  editPic: string[]
  selectedImageFile: File | null
  previewImageUrl: string
  setSelectedImageFile: (file: File | null) => void

  clearSelectedImageFile: () => void
  removeProductImage: () => void
  cancelEditProduct: () => void
  saveProduct: (event: FormEvent<HTMLFormElement>) => void

  isEditCategoryOpen: boolean
  setIsEditCategoryOpen: (value: boolean | ((current: boolean) => boolean)) => void

  isEditSubcategoryOpen: boolean
  setIsEditSubcategoryOpen: (value: boolean | ((current: boolean) => boolean)) => void

  categoryOptions: string[]
  subcategoryOptions: string[]
  editCategoryLabel: string
  editSubcategoryLabel: string
}

export function AdminProductForm({
  editFormRef,
  imageInputRef,
  isCreatingProduct,
  isSavingProduct,

  editName,
  setEditName,

  editCost,
  setEditCost,

  editCategory,
  setEditCategory,

  editSubcategory,
  setEditSubcategory,

  editDesc,
  setEditDesc,

  editPic,
  selectedImageFile,
  previewImageUrl,
  setSelectedImageFile,

  clearSelectedImageFile,
  removeProductImage,
  cancelEditProduct,
  saveProduct,

  isEditCategoryOpen,
  setIsEditCategoryOpen,

  isEditSubcategoryOpen,
  setIsEditSubcategoryOpen,

  categoryOptions,
  subcategoryOptions,
  editCategoryLabel,
  editSubcategoryLabel,
}: AdminProductFormProps) {
  return (
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
            ref={imageInputRef}
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

          <div className="admin-file-input__actions">
            {selectedImageFile ? (
              <button
                type="button"
                className="admin-file-input__remove"
                onClick={clearSelectedImageFile}
              >
                Убрать выбранный файл
              </button>
            ) : editPic[0] ? (
              <button
                type="button"
                className="admin-file-input__remove"
                onClick={removeProductImage}
              >
                Удалить изображение
              </button>
            ) : null}
          </div>
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
  )
}
