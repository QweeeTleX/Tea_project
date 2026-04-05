import { Link } from "react-router-dom"
import { useCart } from "../cart/CartContext"
import "../../Styles/Cart.css"


const FILES_BASE = "http://localhost:5000"

function resolveImageSrc(src) {
  if (!src) return ""
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith("/")) return `${FILES_BASE}${src}`
  return `${FILES_BASE}/${src}`
}

function Cart() {
  const {
    items,
    itemsCount,
    totalCost,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart()

  return (
    <div className="cart-page">
      <div className="cart">
        <div className="cart__header">
          <Link className="cart__back" to="/">
            Назад
          </Link>
          <h1 className="cart__title">Корзина</h1>
        </div>

        {items.length === 0 ? (
          <div className="cart__empty">Корзина пока пуста</div>
        ) : (
          <>
            <div className="cart__list">
              {items.map((item) => (
                <div key={item.id} className="cart__item">
                  <div className="cart__thumb">
                    {item.pic?.[0] ? (
                      <img
                        className="cart__img"
                        src={resolveImageSrc(item.pic[0])}
                        alt={item.name}
                      />
                    ) : null}
                  </div>

                  <div className="cart__main">
                    <Link
                      className="cart__name"
                      to={`/catalog/${item.categoryId}/${item.subId}/${item.id}`}
                    >
                      {item.name}
                    </Link>

                    <div className="cart__price">{item.cost} ₽</div>

                    <div className="cart__qty">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart__sum">
                      Сумма: {item.cost * item.quantity} ₽
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cart__remove"
                    onClick={() => removeItem(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>

            <div className="cart__summary">
              <div>Товаров: {itemsCount}</div>
              <div>Итого: {totalCost} ₽</div>

              <button type="button" className="cart__clear" onClick={clearCart}>
                Очистить корзину
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart
