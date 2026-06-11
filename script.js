// ===== GLOBAL VARIABLES =====
let whatsappURL = "";
let cart = []; // Store cart items

// ===== MOBILE MENU LOGIC =====
function toggleMenu() {
  const menu = document.getElementById("nav-menu");
  const hamburger = document.getElementById("hamburger");
  // Only toggle if we are on mobile (hamburger is visible)
  if (window.getComputedStyle(hamburger).display !== 'none') {
    menu.classList.toggle("active");
    hamburger.classList.toggle("active");
  }
}

// ===== CAROUSEL LOGIC =====
function slideCarousel(carouselId, direction) {
  const track = document.getElementById(carouselId);
  const wrapper = track.parentElement;

  let scrollAmount;
  if (window.innerWidth <= 768) {
    const card = track.querySelector('.product-card');
    const gap = parseInt(window.getComputedStyle(track).gap) || 0;
    scrollAmount = card.offsetWidth + gap;
  } else {
    scrollAmount = wrapper.clientWidth * 0.8;
  }

  wrapper.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// ===== QTY & CART LOGIC =====
function changeQty(btn, amount) {
  const input = btn.parentElement.querySelector('input');
  let currentVal = parseInt(input.value) || 1;
  let newVal = currentVal + amount;
  if (newVal < 1) newVal = 1;
  input.value = newVal;
}

function addToCart(productName, btn) {
  const input = btn.parentElement.querySelector('.qty-selector input');
  const qty = parseInt(input.value) || 1;
  const priceText = btn.parentElement.querySelector('.price').innerText;
  const price = parseInt(priceText.replace(/\D/g, ''));

  const existingItem = cart.find(item => item.name === productName);
  if (existingItem) {
    existingItem.qty += qty;
  } else {
    cart.push({ name: productName, qty: qty, price: price });
  }
  updateCartDisplay();

  // reset input
  input.value = 1;
  alert(qty + " x " + productName + " added to cart!");
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartDisplay();
}

function updateCartDisplay() {
  const cartList = document.getElementById("cartItemsList");
  const submitBtn = document.getElementById("submitOrderBtn");
  const totalDisplay = document.getElementById("cartTotalDisplay");

  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = "<li>Cart is empty</li>";
    submitBtn.disabled = true;
    if (totalDisplay) totalDisplay.style.display = "none";
    return;
  }

  submitBtn.disabled = false;
  let totalAmount = 0;

  cart.forEach((item, index) => {
    totalAmount += item.price * item.qty;
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.name} x ${item.qty} (₹${item.price * item.qty})</span>
      <span class="remove-btn" onclick="removeFromCart(${index})">Remove</span>
    `;
    cartList.appendChild(li);
  });

  if (totalDisplay) {
    totalDisplay.innerText = "Total: ₹" + totalAmount;
    totalDisplay.style.display = "block";
  }
}

// ===== ORDER FORM SUBMIT =====
document.getElementById("orderForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Please add items to your cart first.");
    return;
  }

  const msgDiv = document.getElementById("validationMessage");
  msgDiv.style.display = "none";
  msgDiv.innerText = "";

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!name || !phone || !email || !address) {
    msgDiv.innerText = "Please fill in all mandatory fields.";
    msgDiv.style.display = "block";
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    msgDiv.innerText = "Please enter a valid 10-digit mobile number.";
    msgDiv.style.display = "block";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msgDiv.innerText = "Please enter a valid email address.";
    msgDiv.style.display = "block";
    return;
  }

  const submitBtn = document.getElementById("submitOrderBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "Processing...";

  let totalAmount = 0;
  let cartItemsText = cart.map(item => {
    totalAmount += item.price * item.qty;
    return `${item.name} × ${item.qty}`;
  }).join("\n\n");

  let whatsappMessage = `Hello Sattvo,\n\nI would like to place an order.\n\nName:\n${name}\n\nMobile:\n${phone}\n\nEmail:\n${email}\n\nDelivery Address:\n${address}\n\nORDER DETAILS\n\n${cartItemsText}\n\nTotal Amount:\n₹${totalAmount}\n\nThank you.\n\nNourish • Strength • Thrive`;

  let whatsappNumber = "917019268918";
  let finalWhatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  try {
    const response = await fetch(`/api/submit-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customer: { name, phone, email, address },
        cart: cart,
        totalAmount: totalAmount
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to submit order");

    window.open(finalWhatsappURL, "_blank");

    document.getElementById("orderForm").reset();
    cart = [];
    updateCartDisplay();

  } catch (error) {
    alert("Error: " + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" width="24"> Order on WhatsApp';
  }
});

// ===== POLICY MODALS =====
function openPolicyModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}
function closePolicyModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}
function closePolicyModalOutside(event, modalId) {
  if (event.target.id === modalId) {
    closePolicyModal(modalId);
  }
}
