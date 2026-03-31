const products = [
  { id: 1, code: "P001", name_en: "Instant Coffee Mix", name_mm: "ကော်ဖီမစ်", category_en: "Beverage", category_mm: "အဖျော်ယမကာ", price: 1200, stock: 40 },
  { id: 2, code: "P002", name_en: "Shampoo", name_mm: "ခေါင်းလျှော်ရည်", category_en: "Personal Care", category_mm: "ကိုယ်ပိုင်အသုံးအဆောင်", price: 3500, stock: 25 },
  { id: 3, code: "P003", name_en: "Soft Drink", name_mm: "အအေးသောက်ရည်", category_en: "Drink", category_mm: "အဖျော်ယမကာ", price: 1800, stock: 60 },
  { id: 4, code: "P004", name_en: "Snack Chips", name_mm: "အာလူးကြော်", category_en: "Snack", category_mm: "မုန့်", price: 1500, stock: 35 },
  { id: 5, code: "P005", name_en: "Milk Powder", name_mm: "နို့မှုန့်", category_en: "Dairy", category_mm: "နို့ထွက်ပစ္စည်း", price: 6200, stock: 20 },
  { id: 6, code: "P006", name_en: "Soap", name_mm: "ဆပ်ပြာ", category_en: "Household", category_mm: "အိမ်သုံးပစ္စည်း", price: 900, stock: 50 },
  { id: 7, code: "P007", name_en: "Toothpaste", name_mm: "သွားတိုက်ဆေး", category_en: "Personal Care", category_mm: "ကိုယ်ပိုင်အသုံးအဆောင်", price: 2200, stock: 30 },
  { id: 8, code: "P008", name_en: "Cooking Oil", name_mm: "ဟင်းချက်ဆီ", category_en: "Grocery", category_mm: "ကုန်စုံ", price: 7800, stock: 18 }
];

let currentLanguage = "en";
let currentCurrency = "MMK";
let cart = [];
let returnItems = 0;

const TAX_RATE = 0.05;
const BAHT_RATE = 75;

const productGrid = document.getElementById("productGrid");
const cartList = document.getElementById("cartList");
const searchInput = document.getElementById("searchInput");
const langToggle = document.getElementById("langToggle");
const currencySelect = document.getElementById("currencySelect");
const cameraBtn = document.getElementById("cameraBtn");
const cameraBox = document.getElementById("cameraBox");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const printBtn = document.getElementById("printBtn");

function formatCurrency(value) {
  if (currentCurrency === "BAHT") {
    return "฿ " + new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value / BAHT_RATE);
  }
  return "MMK " + new Intl.NumberFormat("en-US").format(value);
}

function getText(en, mm) {
  return currentLanguage === "en" ? en : mm;
}

function updateLanguage() {
  document.querySelectorAll("[data-en]").forEach(el => {
    el.textContent = currentLanguage === "en" ? el.dataset.en : el.dataset.mm;
  });

  langToggle.textContent = currentLanguage === "en" ? "မြန်မာ" : "English";
  searchInput.placeholder = currentLanguage === "en"
    ? "Search goods / ကုန်ပစ္စည်းရှာရန်..."
    : "ကုန်ပစ္စည်းရှာရန် / Search goods...";
}

function renderProducts(list = products) {
  productGrid.innerHTML = "";

  if (list.length === 0) {
    productGrid.innerHTML = `
      <div class="cart-empty">${getText("No products found.", "ပစ္စည်းမတွေ့ပါ။")}</div>
    `;
    return;
  }

  list.forEach(product => {
    const name = currentLanguage === "en" ? product.name_en : product.name_mm;
    const category = currentLanguage === "en" ? product.category_en : product.category_mm;

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${name}</h3>
      <div class="product-meta">
        <span>${product.code}</span>
        <span>${category}</span>
      </div>
      <div class="product-price">${formatCurrency(product.price)}</div>
      <div class="product-actions">
        <span class="stock">${getText("Stock", "လက်ကျန်")}: ${product.stock}</span>
        <button class="btn primary" onclick="addToCart(${product.id})">${getText("Add", "ထည့်ရန်")}</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);

  if (existing) {
    if (existing.qty < product.stock) {
      existing.qty += 1;
    }
  } else {
    cart.push({ ...product, qty: 1 });
  }

  renderCart();
}

function increaseQty(id) {
  const item = cart.find(i => i.id === id);
  const product = products.find(p => p.id === id);
  if (item && item.qty < product.stock) {
    item.qty += 1;
  }
  renderCart();
}

function decreaseQty(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty -= 1;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  renderCart();
}

function removeItem(id) {
  const item = cart.find(i => i.id === id);
  if (item) {
    returnItems += item.qty;
  }
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = `<div class="cart-empty">${getText("Cart is empty.", "Cart ထဲတွင် ပစ္စည်းမရှိပါ။")}</div>`;
  } else {
    cart.forEach(item => {
      const name = currentLanguage === "en" ? item.name_en : item.name_mm;
      const itemTotal = item.price * item.qty;

      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <div class="cart-item-top">
          <div>
            <h4>${name}</h4>
            <small>${item.code} • ${formatCurrency(item.price)}</small>
          </div>
          <strong>${formatCurrency(itemTotal)}</strong>
        </div>

        <div class="qty-controls">
          <button class="qty-btn" onclick="decreaseQty(${item.id})">-</button>
          <strong>${item.qty}</strong>
          <button class="qty-btn" onclick="increaseQty(${item.id})">+</button>
          <button class="remove-btn" onclick="removeItem(${item.id})">${getText("Remove", "ဖျက်ရန်")}</button>
        </div>
      `;
      cartList.appendChild(div);
    });
  }

  const subtotal = calculateSubtotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  document.getElementById("subtotal").textContent = formatCurrency(subtotal);
  document.getElementById("tax").textContent = formatCurrency(tax);
  document.getElementById("total").textContent = formatCurrency(total);

  updateDashboard(subtotal, total);
  renderReceipt();
}

function updateDashboard(subtotal, total) {
  const soldQty = cart.reduce((sum, item) => sum + item.qty, 0);

  document.getElementById("dashboardSales").textContent = formatCurrency(subtotal);
  document.getElementById("dashboardReturns").textContent = formatCurrency(returnItems * 1000);
  document.getElementById("dashboardNet").textContent = formatCurrency(total);

  document.getElementById("soldItems").textContent = soldQty;
  document.getElementById("returnItems").textContent = returnItems;
  document.getElementById("netItems").textContent = soldQty - returnItems;
}

function renderReceipt() {
  const receiptItems = document.getElementById("receiptItems");
  receiptItems.innerHTML = "";

  if (cart.length === 0) {
    receiptItems.innerHTML = `<div class="cart-empty">${getText("No items in receipt.", "ဘောင်ချာတွင် ပစ္စည်းမရှိပါ။")}</div>`;
  } else {
    cart.forEach(item => {
      const name = currentLanguage === "en" ? item.name_en : item.name_mm;
      const row = document.createElement("div");
      row.className = "receipt-item";
      row.innerHTML = `
        <span>${name} x ${item.qty}</span>
        <strong>${formatCurrency(item.price * item.qty)}</strong>
      `;
      receiptItems.appendChild(row);
    });
  }

  const subtotal = calculateSubtotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  document.getElementById("receiptSubtotal").textContent = formatCurrency(subtotal);
  document.getElementById("receiptTax").textContent = formatCurrency(tax);
  document.getElementById("receiptTotal").textContent = formatCurrency(total);
  document.getElementById("receiptDate").textContent = new Date().toLocaleString();
}

function filterProducts() {
  const keyword = searchInput.value.toLowerCase().trim();

  const filtered = products.filter(product =>
    product.code.toLowerCase().includes(keyword) ||
    product.name_en.toLowerCase().includes(keyword) ||
    product.name_mm.toLowerCase().includes(keyword) ||
    product.category_en.toLowerCase().includes(keyword) ||
    product.category_mm.toLowerCase().includes(keyword)
  );

  renderProducts(filtered);
}

langToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "mm" : "en";
  updateLanguage();
  renderProducts();
  renderCart();
});

currencySelect.addEventListener("change", e => {
  currentCurrency = e.target.value;
  renderProducts();
  renderCart();
});

searchInput.addEventListener("input", filterProducts);

cameraBtn.addEventListener("click", () => {
  cameraBox.classList.toggle("hidden");
});

clearCartBtn.addEventListener("click", () => {
  cart = [];
  renderCart();
});

checkoutBtn.addEventListener("click", () => {
  alert(getText("Checkout completed successfully.", "ငွေချေမှုအောင်မြင်ပါသည်။"));
  renderReceipt();
  document.getElementById("receiptSection").scrollIntoView({ behavior: "smooth" });
});

printBtn.addEventListener("click", () => {
  window.print();
});

updateLanguage();
renderProducts();
renderCart();
