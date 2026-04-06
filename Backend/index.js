const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const fs = require("fs")
const path = require("path")

const app = express()
const imagesPath = path.join(__dirname, "..", "images")

app.use("/images", express.static(imagesPath))
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
)

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me"

// Временно in-memory. Потом вынеси в БД.
const users = [
  {
    id: 1,
    email: "admin@tea.local",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    permissions: ["admin:enter", "products:write"],
  },
  {
    id: 2,
    email: "manager@tea.local",
    passwordHash: bcrypt.hashSync("manager123", 10),
    role: "manager",
    permissions: ["admin:enter"],
  },
  {
    id: 3,
    email: "user@tea.local",
    passwordHash: bcrypt.hashSync("user123", 10),
    role: "user",
    permissions: [],
  },
]

function readJsonl(filePath) {
  const raw = fs.readFileSync(filePath, "utf8")

  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      const item = JSON.parse(line)

      return {
        id: item.source_file?.replace(/\.md$/i, "") || `card-${index + 1}`,
        name: item.name,
        pic: item.pic || [],
        cost: item.cost ?? null,
        desc: item.desc || "",
        category: item.category,
        subcategory: item.subcategory,
        source_file: item.source_file,
      }
    })
}

const cardsPath = path.join(__dirname, "base", "cards.jsonl")
const cards = readJsonl(cardsPath)

const catalogMap = {
  tea: {
    dbCategory: "Китайский Чай",
    subcategories: {
      "white-tea": "Белый Чай",
      "guangdong-oolongs": "Гуандунские улуны",
      "yellow-tea": "Желтый Чай",
      "green-tea": "Зеленые чаи",
      "red-tea": "Красные чаи",
      herbal: "Нечайные чаи",
      "north-fujian-oolongs": "Северофуцзяньские улуны",
      "taiwan-oolongs": "Тайваньские улуны",
      "shu-puer": "Шу пуэры",
      "sheng-puer": "Шэн пуэры",
      "south-fujian-oolongs": "Южнофуцзяньские улуны",
    },
  },

  wares: {
    dbCategory: "Посуда и товары",
    subcategories: {
      "incense-1": "Благовония \"Сян Дао\"",
      "incense-2": "Благовония 'Сян Дао'",
      gaiwans: "Гайвани",
      tools: "Инструменты",
      "tools-incense": "Инструменты для \"Сян Дао\"",
      books: "Книги",
      burners: "Курильницы",
      sets: "Наборы",
      art: "Предметы искусства",
      other: "Прочее",
      sieves: "Сита",
      statuettes: "Статуэтки",
      thermos: "Термосы и колбы",
      jewelry: "Украшения",
      teapots: "Чайники",
      "tea-caddies": "Чайницы",
      "cha-pan": "Чапани",
      "cha-hai-pl": "Чахаи",
      "cha-hai": "Чахай",
      "cha-he": "Чахэ",
      cups: "Чашки",
    },
  },
}

function resolveCatalogTarget(categoryId, subId) {
  const categoryConfig = catalogMap[categoryId]
  if (!categoryConfig) return null

  const dbSubcategory = categoryConfig.subcategories[subId]
  if (!dbSubcategory) return null

  return {
    dbCategory: categoryConfig.dbCategory,
    dbSubcategory,
  }
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      permissions: user.permissions,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  )
}

function auth(req, res, next) {
  const token = req.cookies.access_token
  if (!token) return res.status(401).json({ message: "Unauthorized" })

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    const ok =
      req.user.role === "admin" ||
      (req.user.permissions || []).includes(permission)

    if (!ok) return res.status(403).json({ message: "Forbidden" })
    next()
  }
}

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body
  const user = users.find((u) => u.email === email)
  if (!user) return res.status(401).json({ message: "Invalid credentials" })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ message: "Invalid credentials" })

  const token = signToken(user)

  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // в проде true (HTTPS)
    maxAge: 60 * 60 * 1000,
  })

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  })
})

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("access_token")
  res.status(204).end()
})

app.get("/api/catalog/:categoryId/:subId", (req, res) => {
  const { categoryId, subId } = req.params

  const target = resolveCatalogTarget(categoryId, subId)
  if (!target) {
    return res.status(404).json({ message: "Subcategory not found" })
  }

  const products = cards.filter(
    (card) =>
      card.category === target.dbCategory &&
      card.subcategory === target.dbSubcategory
  )

  res.json({
    categoryId,
    subId,
    category: target.dbCategory,
    subcategory: target.dbSubcategory,
    count: products.length,
    products,
  })
})

app.get("/api/product/:productId", (req, res) => {
  const { productId } = req.params

  const product = cards.find((card) => card.id === productId)

  if (!product) {
    return res.status(404).json({ message: "Product not found" })
  }

  res.json(product)
})


app.get("/api/auth/me", auth, (req, res) => {
  const user = users.find((u) => u.id === req.user.sub)
  if (!user) return res.status(401).json({ message: "Unauthorized" })

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  })
})

app.get("/api/admin/ping", auth, requirePermission("admin:enter"), (req, res) => {
  res.json({ ok: true, message: "Admin access granted" })
})

app.get("/api/admin/products", auth, requirePermission("admin:enter"), (req, res) => {
  const products = [...cards]
    .sort((a, b) => {
      return (
        a.category.localeCompare(b.category, "ru") ||
        a.subcategory.localeCompare(b.subcategory, "ru") ||
        a.name.localeCompare(b.name, "ru")
      )
    })
    .map((card) => ({
      id: card.id,
      name: card.name,
      cost: card.cost,
      category: card.category,
      subcategory: card.subcategory,
      pic: card.pic,
      status: "published",
    }))
  
  res.json({
    count: products.length,
    products,
  })  
})

app.get("/", (req, res) => res.send("Backend is working!"))

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})
