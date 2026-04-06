import { useEffect, useState } from "react"
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
  category: string
  subcategory: string
  price: string
  status: "published" | "draft"
}

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

const adminProducts: AdminProductRow[] = [
  {
    id: "p-01",
    name: "Да Юй Линь 2025",
    category: "Китайский чай",
    subcategory: "Тайваньские улуны",
    price: "950 ₽",
    status: "published",
  },
  {
    id: "p-02",
    name: "Шуй Сянь",
    category: "Китайский чай",
    subcategory: "Северофуцзяньские улуны",
    price: "300 ₽",
    status: "published",
  },
  {
    id: "p-03",
    name: "Новый товар",
    category: "Черновик",
    subcategory: "Не выбрано",
    price: "Цена позже",
    status: "draft",
  },
]

function Admin() {
  const [activeSection, setActiveSection] = useState<AdminSectionId>("overview")
  const [pingStatus, setPingStatus] = useState<"loading" | "ok" | "error">("loading")

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

  const activeSectionMeta =
    adminSections.find((section) => section.id === activeSection) || adminSections[0]

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
                    Пока это UI-слой. Следующий шаг после него — реальные API для CRUD.
                  </p>
                </div>

                <button type="button" className="admin-panel__action">
                  Добавить товар
                </button>
              </div>

              <div className="admin-table">
                {adminProducts.map((product) => (
                  <div key={product.id} className="admin-row">
                    <div className="admin-row__main">
                      <div className="admin-row__name">{product.name}</div>
                      <div className="admin-row__meta">
                        {product.category} / {product.subcategory}
                      </div>
                    </div>

                    <div className="admin-row__price">{product.price}</div>

                    <div
                      className={`admin-badge admin-badge--${product.status}`}
                    >
                      {product.status === "published" ? "Опубликован" : "Черновик"}
                    </div>

                    <div className="admin-row__actions">
                      <button type="button" className="admin-row__btn">
                        Редактировать
                      </button>
                      <button type="button" className="admin-row__btn admin-row__btn--ghost">
                        Архив
                      </button>
                    </div>
                  </div>
                ))}
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
