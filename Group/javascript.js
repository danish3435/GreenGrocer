document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ELEMENT SELECTIONS ---
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const productCards = document.querySelectorAll('.card');
    
    const cartItemsList = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('subtotal');
    const grandTotalEl = document.getElementById('grandTotal');
    const payBtn = document.getElementById('payBtn');

    // --- NEW: INITIALIZE BADGE ON PAGE LOAD ---
    updateCartBadge();

    // --- 2. SEARCH & FILTER LOGIC ---
    function filterProducts() {
        if (!searchInput || !categoryFilter) return; 

        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        productCards.forEach(card => {
            const productName = card.querySelector('h4').textContent.toLowerCase();
            const productCategory = card.getAttribute('data-category');

            const matchesSearch = productName.includes(searchTerm);
            const matchesCategory = (selectedCategory === 'all' || productCategory === selectedCategory);

            card.style.display = (matchesSearch && matchesCategory) ? 'flex' : 'none';
        });
    }

    if (searchInput) searchInput.addEventListener('input', filterProducts);
    if (searchBtn) searchBtn.addEventListener('click', filterProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);


    // --- 3. ADD TO CART LOGIC ---
    const allAddBtns = document.querySelectorAll('.add-btn');
    allAddBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (!card) return;

            const name = card.querySelector('h4').textContent;
            
            // Clean price logic for promotions
            let priceContainer = card.querySelector('.price').cloneNode(true);
            const struckPrice = priceContainer.querySelector('span');
            if (struckPrice) struckPrice.remove(); 
            
            const priceText = priceContainer.textContent.trim();
            const price = parseFloat(priceText.replace('RM ', ''));

            const category = card.getAttribute('data-category');
            const qtyInput = card.querySelector('.qty-input');
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

            let cart = JSON.parse(localStorage.getItem('gg_cart')) || [];
            cart.push({ name, price, category, quantity });
            
            localStorage.setItem('gg_cart', JSON.stringify(cart));

            // --- NEW: UPDATE BADGE IMMEDIATELY AFTER ADDING ---
            updateCartBadge();
            
            alert(`${quantity}x ${name} added to cart!`);
        });
    });


    // --- 4. RENDER CART ---
    if (cartItemsList) {
        renderCart();
    }

    function renderCart() {
        let cart = JSON.parse(localStorage.getItem('gg_cart')) || [];
        const content = document.getElementById('cartContent');
        const empty = document.getElementById('emptyCartMsg');

        if (cart.length === 0) {
            if (content) content.style.display = 'none';
            if (empty) empty.style.display = 'block';
            return;
        }

        cartItemsList.innerHTML = '';
        let subtotal = 0;
        let householdCount = 0;

        cart.forEach((item) => {
            const itemTotal = item.price * (item.quantity || 1);
            subtotal += itemTotal;
            if(item.category === 'household') householdCount++;

            const div = document.createElement('div');
            div.style = "display:flex; justify-content:space-between; padding: 15px 0; border-bottom: 1px solid #eee;";
            div.innerHTML = `
                <span>${item.quantity || 1}x ${item.name}</span> 
                <strong>RM ${itemTotal.toFixed(2)}</strong>
            `;
            cartItemsList.appendChild(div);
        });

        let discount = 0;
        const discountRow = document.getElementById('discountRow');
        if (householdCount >= 2) {
            discount = subtotal * 0.10;
            if (discountRow) {
                discountRow.style.display = 'flex';
                document.getElementById('discountVal').textContent = `-RM ${discount.toFixed(2)}`;
            }
        }

        if (subtotalEl) subtotalEl.textContent = `RM ${subtotal.toFixed(2)}`;
        if (grandTotalEl) grandTotalEl.textContent = `RM ${(subtotal - discount).toFixed(2)}`;
    }

// --- CONTACT FORM LOGIC ---
const contactForm = document.getElementById('contactForm');
const toast = document.getElementById('toast');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Stop page from refreshing

        // Change button state
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "Sending...";
        btn.style.opacity = "0.7";
        btn.disabled = true;

        // Simulate an API call delay
        setTimeout(() => {
            // Show Success Notification
            toast.style.display = "block";
            setTimeout(() => toast.classList.add('show'), 10);

            // Reset Form
            contactForm.reset();
            btn.innerText = originalText;
            btn.style.opacity = "1";
            btn.disabled = false;

            // Hide Notification after 5 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.style.display = "none", 500);
            }, 5000);
            
        }, 1200);
    });
}
    // --- 5. PAYMENT & RECEIPT ---
    if (payBtn) {
        payBtn.addEventListener('click', () => {
            const isDelivery = confirm("📦 Order Preference:\n\nClick OK for Home Delivery (+RM 5.00 fee)\nClick Cancel for Store Pickup (Free)");
            
            const deliveryFee = isDelivery ? 5.0 : 0.0;
            const method = isDelivery ? "Home Delivery" : "Store Pickup";
            
            const cart = JSON.parse(localStorage.getItem('gg_cart')) || [];
            const receiptItems = document.getElementById('receiptItems');
            
            const currentTotal = parseFloat(document.getElementById('grandTotal').textContent.replace('RM ', ''));
            const finalPaidAmount = currentTotal + deliveryFee;

            if (receiptItems) {
                receiptItems.innerHTML = '';
                cart.forEach(item => {
                    const row = document.createElement('div');
                    row.style = "display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.9rem;";
                    row.innerHTML = `<span>${item.quantity}x ${item.name}</span> <span>RM ${(item.price * item.quantity).toFixed(2)}</span>`;
                    receiptItems.appendChild(row);
                });

                if (isDelivery) {
                    const feeRow = document.createElement('div');
                    feeRow.style = "display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.9rem; color: #666; border-top: 1px solid #eee; padding-top: 5px;";
                    feeRow.innerHTML = `<span>Delivery Fee</span> <span>RM 5.00</span>`;
                    receiptItems.appendChild(feeRow);
                }
            }

            document.getElementById('receiptRef').textContent = "GG-" + Math.floor(1000 + Math.random() * 9000);
            document.getElementById('receiptMethod').textContent = method;
            document.getElementById('receiptTotal').textContent = `RM ${finalPaidAmount.toFixed(2)}`;

            document.getElementById('cartContent').style.display = 'none';
            document.getElementById('receiptSection').style.display = 'block';

            alert(`Order Successful!\nTotal Paid: RM ${finalPaidAmount.toFixed(2)} (${method})`);
            
            localStorage.removeItem('gg_cart');
            updateCartBadge(); // Reset badge after purchase
        });
    }

    const yearSpan = document.getElementById('year');
    if(yearSpan) yearSpan.textContent = "2026"; 

    // --- 6. THE BADGE LOGIC FUNCTION ---
    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('gg_cart')) || [];
        const badge = document.getElementById('cart-count');
        
        if (badge) {
            const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
            
            if (totalItems > 0) {
                badge.textContent = `(${totalItems})`;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    }
});

function clearCart() {
    localStorage.removeItem('gg_cart');
    location.reload();
}