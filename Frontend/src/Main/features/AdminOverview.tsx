import type { RequestStatus } from "../types/admin"
import "../../Styles/AdminOverview.css"

type PingStatus = "loading" | "ok" | "error"

type AdminOverviewProps = {
  pingStatus: PingStatus
  productStatus: RequestStatus
  productsError: string
  catalogOptionsError: string
  totalProducts: number
  totalCategories: number
  totalSubcategories: number
  invalidCount: number
  missingPriceCount: number
  missingImageCount: number
  onOpenProducts: () => void
  onCreateProduct: () => void
}

function getProductsStateMeta(
  productStatus: RequestStatus,
  productsError: string,
  totalProducts: number
) {
  if (productStatus === "loading" || productStatus === "idle") {
    return {
      tone: "loading" as const,
      badge: "Загрузка",
      text: "Получаем список товаров из backend",
    }
  }

  if (productStatus === "error") {
    return {
      tone: "error" as const,
      badge: "Ошибка",
      text: productsError || "Не удалось загрузить товары",
    }
  }

  return {
    tone: "ok" as const,
    badge: "Готово",
    text: `Загружено товаров: ${totalProducts}`,
  }
}

function getCatalogStateMeta(
  catalogOptionsError: string,
  totalCategories: number,
  totalSubcategories: number
) {
  if (catalogOptionsError) {
    return {
      tone: "error" as const,
      badge: "Ошибка",
      text: catalogOptionsError,
    }
  }

  if (totalCategories === 0) {
    return {
      tone: "loading" as const,
      badge: "Загрузка",
      text: "Получаем структуру каталога",
    }
  }

  return {
    tone: "ok" as const,
    badge: "Готово",
    text: `Категорий: ${totalCategories}, подкатегорий: ${totalSubcategories}`,
  }
}

export function AdminOverview({
  pingStatus,
  productStatus,
  productsError,
  catalogOptionsError,
  totalProducts,
  totalCategories,
  totalSubcategories,
  invalidCount,
  missingPriceCount,
  missingImageCount,
  onOpenProducts,
  onCreateProduct,
}: AdminOverviewProps) {
  const backendState =
    pingStatus === "loading"
      ? {
          tone: "loading" as const,
          badge: "Проверка",
          text: "Проверяем доступность backend админки",
        }
      : pingStatus === "ok"
        ? {
            tone: "ok" as const,
            badge: "Онлайн",
            text: "Авторизация и admin API отвечают",
          }
        : {
            tone: "error" as const,
            badge: "Ошибка",
            text: "Backend не отвечает, CRUD сейчас под риском",
          }

  const productsState = getProductsStateMeta(productStatus, productsError, totalProducts)
  const catalogState = getCatalogStateMeta(
    catalogOptionsError,
    totalCategories,
    totalSubcategories
  )

  const alerts: string[] = []

  if (pingStatus === "error") {
    alerts.push("Backend админки не отвечает. Проверь сервер перед изменением каталога.")
  }

  if (productStatus === "error") {
    alerts.push(productsError || "Не удалось загрузить товары из backend.")
  }

  if (catalogOptionsError) {
    alerts.push(catalogOptionsError)
  }

  if (invalidCount > 0) {
    alerts.push(`Проблемных записей импорта: ${invalidCount}. Они не попадают на витрину.`)
  }

  if (missingPriceCount > 0) {
    alerts.push(`Товаров без цены: ${missingPriceCount}. Стоит пройтись по карточкам.`)
  }

  if (missingImageCount > 0) {
    alerts.push(`Товаров без изображения: ${missingImageCount}. Каталог выглядит неполным.`)
  }

  return (
    <section className="admin-grid">
      <div className="admin-metrics">
        <article className="admin-card admin-metric">
          <div className="admin-metric__label">Товары</div>
          <div className="admin-metric__value">{totalProducts}</div>
          <div className="admin-metric__hint">Всего карточек, доступных в админке</div>
        </article>

        <article className="admin-card admin-metric">
          <div className="admin-metric__label">Категории</div>
          <div className="admin-metric__value">{totalCategories}</div>
          <div className="admin-metric__hint">Количество разделов каталога</div>
        </article>

        <article className="admin-card admin-metric">
          <div className="admin-metric__label">Подкатегории</div>
          <div className="admin-metric__value">{totalSubcategories}</div>
          <div className="admin-metric__hint">Структура витрины, с которой работает админка</div>
        </article>

        <article className="admin-card admin-metric">
          <div className="admin-metric__label">Импорт</div>
          <div className="admin-metric__value">{invalidCount}</div>
          <div className="admin-metric__hint">Проблемные записи, не попавшие на витрину</div>
        </article>

        <article className="admin-card admin-metric">
          <div className="admin-metric__label">Без цены</div>
          <div className="admin-metric__value">{missingPriceCount}</div>
          <div className="admin-metric__hint">Карточки, где стоимость пока не заполнена</div>
        </article>

        <article className="admin-card admin-metric">
          <div className="admin-metric__label">Без фото</div>
          <div className="admin-metric__value">{missingImageCount}</div>
          <div className="admin-metric__hint">Товары, которым не хватает изображения</div>
        </article>
      </div>

      <div className="admin-overview__columns">
        <article className="admin-card admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">Состояние системы</h3>
          </div>

          <div className="admin-overview__status-list">
            <div className="admin-overview__status-item">
              <div className="admin-overview__status-copy">
                <div className="admin-overview__status-title">Backend</div>
                <div className="admin-overview__status-text">{backendState.text}</div>
              </div>

              <span className={`admin-status admin-status--${backendState.tone}`}>
                {backendState.badge}
              </span>
            </div>

            <div className="admin-overview__status-item">
              <div className="admin-overview__status-copy">
                <div className="admin-overview__status-title">Каталог товаров</div>
                <div className="admin-overview__status-text">{productsState.text}</div>
              </div>

              <span className={`admin-status admin-status--${productsState.tone}`}>
                {productsState.badge}
              </span>
            </div>

            <div className="admin-overview__status-item">
              <div className="admin-overview__status-copy">
                <div className="admin-overview__status-title">Структура каталога</div>
                <div className="admin-overview__status-text">{catalogState.text}</div>
              </div>

              <span className={`admin-status admin-status--${catalogState.tone}`}>
                {catalogState.badge}
              </span>
            </div>
          </div>
        </article>

        <article className="admin-card admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">Требует внимания</h3>
          </div>

          {alerts.length > 0 ? (
            <div className="admin-overview__alerts">
              {alerts.map((alert) => (
                <div key={alert} className="admin-overview__alert">
                  {alert}
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-overview__alert admin-overview__alert--ok">
              Критичных замечаний сейчас нет. Каталог выглядит стабильно.
            </div>
          )}
        </article>

        <article className="admin-card admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">Быстрые действия</h3>
          </div>

          <p className="admin-panel__text">
            Отсюда можно быстро перейти к каталогу или сразу открыть создание новой карточки.
          </p>

          <div className="admin-overview__actions">
            <button type="button" className="admin-panel__action" onClick={onOpenProducts}>
              Открыть товары
            </button>

            <button
              type="button"
              className="admin-row__btn admin-row__btn--ghost"
              onClick={onCreateProduct}
            >
              Новый товар
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}
