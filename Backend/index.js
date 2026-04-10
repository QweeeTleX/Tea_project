const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const fs = require("fs")
const path = require("path")

const app = express()
const imagesPath = path.join(__dirname, "..", "images")

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]

app.use("/images", express.static(imagesPath))
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
  })
)

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me"

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
        name: typeof item.name === "string" ? item.name : "",
        pic: Array.isArray(item.pic) ? item.pic : [],
        cost: typeof item.cost === "number" ? item.cost : null,
        desc: typeof item.desc === "string" ? item.desc : "",
        category: typeof item.category === "string" ? item.category : "",
        subcategory: typeof item.subcategory === "string" ? item.subcategory : "",
        source_file: typeof item.source_file === "string" ? item.source_file : "",
        importError: typeof item.error === "string" ? item.error : "",
      }
    })
}

const cardsPath = path.join(__dirname, "base", "cards.jsonl")
const cards = readJsonl(cardsPath)

const adminStatePath = path.join(__dirname, "base", "admin-state.json")

function readAdminState() {
  if (!fs.existsSync(adminStatePath)) {
    return {
      deletedIds: [],
      overrides: {},
    }
  }

  const raw = fs.readFileSync(adminStatePath, "utf8")
  const data = JSON.parse(raw)

  return {
     deletedIds: Array.isArray(data.deletedIds) ? data.deletedIds : [],
     overrides: data.overrides && typeof data.overrides === "object" ? data.overrides : {},
  }
}

let adminState = readAdminState()

function saveAdminState() {
  fs.writeFileSync(adminStatePath, JSON.stringify(adminState, null, 2), "utf8")
}

function applyAdminChanges(card) {
  return {
    ...card,
    ...(adminState.overrides[card.id] || {}),
  }
}

function getCatalogCards() {
  return cards
    .filter((card) => !adminState.deletedIds.includes(card.id))
    .map(applyAdminChanges)
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0
}

function isValidCard(card) {
  return hasText(card.name) && hasText(card.category) && hasText(card.subcategory)
}

function getCardIssues(card) {
  const issues = []

  if (!hasText(card.name)) issues.push("missing_name")
  if (!hasText(card.category)) issues.push("missing_category")
  if (!hasText(card.subcategory)) issues.push("missing_subcategory")
  if (hasText(card.importError)) issues.push(card.importError)

  return issues  
}

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
    secure: false,
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

  const products = getCatalogCards().filter(
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

  const product = getCatalogCards().find((card) => card.id === productId)


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
  const validProducts = getCatalogCards()
    .filter(isValidCard)
    .map((card) => ({
      id: card.id,
      name: card.name || "Без названия",
      cost: card.cost,
      category: card.category || "Без категории",
      subcategory: card.subcategory || "Без подкатегории",
      pic: Array.isArray(card.pic) ? card.pic : [],
      status: "published",
    }))
    .sort((a, b) => {
      return (
        a.category.localeCompare(b.category, "ru") ||
        a.subcategory.localeCompare(b.subcategory, "ru") ||
        a.name.localeCompare(b.name, "ru")
      )
    })

    const invalidProducts = getCatalogCards()
      .filter((card) => !isValidCard(card))
      .map((card) => ({
        id: card.id,
        source_file: card.source_file || "unknown_source",
        name: card.name,
        category: card.category,
        subcategory: card.subcategory,
        issues: getCardIssues(card),
      }))
      .sort((a, b) => a.source_file.localeCompare(b.source_file, "en"))

  res.json({
    count: validProducts.length,
    products: validProducts,
    invalidCount: invalidProducts.length,
    invalidProducts,
  })
})

app.put("/api/admin/products/:productId", auth, requirePermission("products:write"), (req, res) => {
  const { productId } = req.params
  const product = getCatalogCards().find((card) => card.id === productId)

  if (!product) {
    return res.status(404).json({ message: "Product not found" })
  }

  const { name, cost, category, subcategory, desc } = req.body

  if (!hasText(name)) {
    return res.status(400).json({ message: "Название товара обязательно" })
  }

  if (!hasText(category)) {
    return res.status(400).json({ message: "Категория обязательна" })
  }

  if (!hasText(subcategory)) {
    return res.status(400).json({ message: "Подкатегория обязательна" })
  }

  const nextCost = cost === "" || cost == null ? null : Number(cost)

  if (nextCost !== null && (!Number.isFinite(nextCost) || nextCost < 0)) {
    return res.status(400).json({ message: "Цена должна быть положительным числом" })
  }

  const override = {
    name: name.trim(),
    cost: nextCost,
    category: category.trim(),
    subcategory: subcategory.trim(),
    desc: typeof desc === "string" ? desc.trim() : product.desc,
  }

  adminState.overrides[productId] = override
  saveAdminState()

  const updatedProduct = {
    ...product,
    ...override,
  }

  res.json({
    product: {
      id: updatedProduct.id,
      name: updatedProduct.name,
      cost: updatedProduct.cost,
      category: updatedProduct.category,
      subcategory: updatedProduct.subcategory,
      pic: updatedProduct.pic,
      desc: updatedProduct.desc,
      status: "published",
    },
  })
})

app.delete("/api/admin/products/:productId", auth, requirePermission("products:write"), (req, res) => {
  const { productId } = req.params
  const product = getCatalogCards().find((card) => card.id === productId)

  if (!product) {
    return res.status(404).json({ message: "Product not found" })
  }

  if (!adminState.deletedIds.includes(productId)) {
    adminState.deletedIds.push(productId)
  }

  delete adminState.overrides[productId]
  saveAdminState()

  res.json({
    ok: true,
    id: productId,
  })
})


app.get("/", (req, res) => res.send("Backend is working!"))

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000")
})
