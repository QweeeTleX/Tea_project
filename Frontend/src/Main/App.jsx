import "../Styles/App.css"
import teaCupIcon from "../Images/tea_cup_icon.svg"
import teaAccessoriesIcon from "../Images/accessories_icon.svg"

const categories = [
  {
    id: "wares",
    title: "Посуда и товары",
    tone: "sage",
    image: teaAccessoriesIcon,
    subtypes: [
      { id: "incense-1", title: "Благовония \"Сян Дао\"" },
      { id: "incense-2", title: "Благовония 'Сян Дао'" },
      { id: "gaiwans", title: "Гайвани" },
      { id: "tools", title: "Инструменты" },
      { id: "tools-incense", title: "Инструменты для \"Сян Дао\"" },
      { id: "books", title: "Книги" },
      { id: "burners", title: "Курильницы" },
      { id: "sets", title: "Наборы" },
      { id: "art", title: "Предметы искусства" },
      { id: "other", title: "Прочее" },
      { id: "sieves", title: "Сита" },
      { id: "statuettes", title: "Статуэтки" },
      { id: "thermos", title: "Термосы и колбы" },
      { id: "jewelry", title: "Украшения" },
      { id: "teapots", title: "Чайники" },
      { id: "tea-caddies", title: "Чайницы" },
      { id: "cha-pan", title: "Чапани" },
      { id: "cha-hai-pl", title: "Чахаи" },
      { id: "cha-hai", title: "Чахай" },
      { id: "cha-he", title: "Чахэ" },
      { id: "cups", title: "Чашки" }
    ]
  },
  {
    id: "tea",
    title: "Китайский Чай",
    tone: "clay",
    image: teaCupIcon,
    subtypes: [
      { id: "white-tea", title: "Белый Чай" },
      { id: "guangdong-oolongs", title: "Гуандунские улуны" },
      { id: "yellow-tea", title: "Желтый Чай" },
      { id: "green-tea", title: "Зеленые чаи" },
      { id: "red-tea", title: "Красные чаи" },
      { id: "herbal", title: "Нечайные чаи" },
      { id: "north-fujian-oolongs", title: "Северофуцзяньские улуны" },
      { id: "taiwan-oolongs", title: "Тайваньские улуны" },
      { id: "shu-puer", title: "Шу пуэры" },
      { id: "sheng-puer", title: "Шэн пуэры" },
      { id: "south-fujian-oolongs", title: "Южнофуцзяньские улуны" }
    ]
  }
]

function App() {
  return (
    <div className="app">
      <div className="cards">
        {categories.map((item) => (
          <div key={item.id} className="card-wrap" data-tone={item.tone}>
            <div className="card" data-tone={item.tone}>
              <img className="card__img" src={item.image} alt={item.title ?? item.id} />
            </div>

            {item.subtypes?.length ? (
              <div className="card__subgrid">
                {item.subtypes.map((sub) => (
                  <div key={sub.id} className="card__subitem">
                    <span className="card__subtext">{sub.title}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
