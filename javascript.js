document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const productCards = document.querySelectorAll('.card');
    
    const cartItemsList = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('subtotal');
    const grandTotalEl = document.getElementById('grandTotal');
    const payBtn = document.getElementById('payBtn');

    const trigger = document.getElementById('menuTrigger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (trigger && mobileMenu) {
        trigger.addEventListener('click', () => {
           
            trigger.classList.toggle('active');
        
            mobileMenu.classList.toggle('show');
        });

        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                trigger.classList.remove('active');
                mobileMenu.classList.remove('show');
            });
        });

        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !mobileMenu.contains(e.target)) {
                trigger.classList.remove('active');
                mobileMenu.classList.remove('show');
            }
        });
    }

    const slides = document.getElementById('slides');
    const dotsContainer = document.getElementById('dots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const allSlides = document.querySelectorAll('.slide');

    let currentIndex = 0;
    const slideCount = allSlides.length;
    let autoPlayInterval;

    if (slides && dotsContainer && slideCount > 0) {
        allSlides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const updateDots = () => {
            const allDots = document.querySelectorAll('.dot');
            allDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        };

        const goToSlide = (index) => {
            currentIndex = index;
            slides.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();
        };

        const moveNext = () => {
            currentIndex = (currentIndex + 1) % slideCount;
            goToSlide(currentIndex);
        };

        const movePrev = () => {
            currentIndex = (currentIndex - 1 + slideCount) % slideCount;
            goToSlide(currentIndex);
        };

        if (nextBtn) nextBtn.addEventListener('click', () => {
            stopAutoPlay();
            moveNext();
            startAutoPlay();
        });

        if (prevBtn) prevBtn.addEventListener('click', () => {
            stopAutoPlay();
            movePrev();
            startAutoPlay();
        });

        const startAutoPlay = () => {
            autoPlayInterval = setInterval(moveNext, 5000);
        };

        const stopAutoPlay = () => clearInterval(autoPlayInterval);

        startAutoPlay();

        if (slides.parentElement) {
            slides.parentElement.addEventListener('mouseenter', stopAutoPlay);
            slides.parentElement.addEventListener('mouseleave', startAutoPlay);
        }

        let touchStartX = 0;
        let touchEndX = 0;

        slides.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        slides.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) {
                stopAutoPlay();
                moveNext();
                startAutoPlay();
            }
            if (touchEndX > touchStartX + 50) {
                stopAutoPlay();
                movePrev();
                startAutoPlay();
            }
        };
    }
    
    updateCartBadge();

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

    const counters = document.querySelectorAll('.counter');
    
    const runCounter = (el) => {
        const target = +el.getAttribute('data-target');
        const speed = 100;
        let current = 0;
        
        const increment = target / speed;

        const update = () => {
            current += increment;
            if (current < target) {
                el.innerText = Math.ceil(current);
                setTimeout(update, 20);
            } else {
                el.innerText = target + (target === 7 ? "" : "+");
            }
        };
        update();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    counters.forEach(c => observer.observe(c));

    const allAddBtns = document.querySelectorAll('.add-btn');
    allAddBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (!card) return;

            const name = card.querySelector('h4').textContent;
            let priceContainer = card.querySelector('.price').cloneNode(true);
            const struckPrice = priceContainer.querySelector('span');
            if (struckPrice) struckPrice.remove(); 
            
            const priceText = priceContainer.textContent.trim();
            const price = parseFloat(priceText.replace('RM ', ''));
            const category = card.getAttribute('data-category');
            const qtyInput = card.querySelector('.qty-input');
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

            let cart = JSON.parse(localStorage.getItem('gg_cart')) || [];
            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ name, price, category, quantity });
            }
            
            localStorage.setItem('gg_cart', JSON.stringify(cart));
            updateCartBadge();
            alert(`${quantity}x ${name} added to cart!`);
        });
    });

    if (cartItemsList) { renderCart(); }

    function renderCart() {
        let cart = JSON.parse(localStorage.getItem('gg_cart')) || [];
        const content = document.getElementById('cartContent');
        const empty = document.getElementById('emptyCartMsg');

        if (cart.length === 0) {
            if (content) content.style.display = 'none';
            if (empty) empty.style.display = 'block';
            updateCartBadge();
            return;
        }

        cartItemsList.innerHTML = '';
        let subtotal = 0;
        let householdCount = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            if(item.category === 'household') householdCount++;

            const div = document.createElement('div');
            div.style = "display:flex; justify-content:space-between; align-items:center; padding: 15px 0; border-bottom: 1px solid #eee;";
            div.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <span style="font-weight:700; color:#1a2b3c;">${item.name}</span>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="display:flex; align-items:center; background:#f8f9fa; border-radius:6px; border:1px solid #ddd;">
                            <button onclick="changeQty(${index}, -1)" style="padding:5px 12px; border:none; background:none; cursor:pointer; font-weight:bold;">-</button>
                            <span style="padding:0 10px; font-weight:bold; min-width:30px; text-align:center;">${item.quantity}</span>
                            <button onclick="changeQty(${index}, 1)" style="padding:5px 12px; border:none; background:none; cursor:pointer; font-weight:bold;">+</button>
                        </div>
                        <button onclick="removeItem(${index})" style="color:#ff4757; background:none; border:none; cursor:pointer; font-size:0.8rem; font-weight:600; padding:0;">Remove All</button>
                    </div>
                </div>
                <strong style="font-size:1.1rem;">RM ${itemTotal.toFixed(2)}</strong>
            `;
            cartItemsList.appendChild(div);
        });

        let discount = 0;
        const dRow = document.getElementById('discountRow');
        if (householdCount >= 2) {
            discount = subtotal * 0.10;
            if (dRow) {
                dRow.style.display = 'flex';
                document.getElementById('discountVal').textContent = `-RM ${discount.toFixed(2)}`;
            }
        } else if (dRow) { dRow.style.display = 'none'; }

        if (subtotalEl) subtotalEl.textContent = `RM ${subtotal.toFixed(2)}`;
        if (grandTotalEl) grandTotalEl.textContent = `RM ${(subtotal - discount).toFixed(2)}`;
    }

    window.changeQty = function(index, delta) {
        let cart = JSON.parse(localStorage.getItem('gg_cart')) || [];
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            if (!confirm(`Remove ${cart[index].name} from cart?`)) {
                cart[index].quantity = 1;
            } else { cart.splice(index, 1); }
        }
        localStorage.setItem('gg_cart', JSON.stringify(cart));
        renderCart();
        updateCartBadge();
    };

    window.removeItem = function(index) {
        let cart = JSON.parse(localStorage.getItem('gg_cart')) || [];
        if (confirm(`Remove all units of ${cart[index].name}?`)) {
            cart.splice(index, 1);
            localStorage.setItem('gg_cart', JSON.stringify(cart));
            renderCart();
            updateCartBadge();
        }
    };

    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Sending...";
            btn.style.opacity = "0.7";
            btn.disabled = true;
            setTimeout(() => {
                toast.style.display = "block";
                setTimeout(() => toast.classList.add('show'), 10);
                contactForm.reset();
                btn.innerText = originalText;
                btn.style.opacity = "1";
                btn.disabled = false;
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => toast.style.display = "none", 500);
                }, 5000);
            }, 1200);
        });
    }

    if (payBtn) {
        payBtn.addEventListener('click', () => {
            const cart = JSON.parse(localStorage.getItem('gg_cart')) || [];
            if (cart.length === 0) return alert("Cart is empty!");

            const isDelivery = confirm("📦 Order Preference:\n\nClick OK for Delivery (+RM 5.00)\nClick Cancel for Pickup (Free)");
            const deliveryFee = isDelivery ? 5.0 : 0.0;
            const method = isDelivery ? "Home Delivery" : "Store Pickup";

            const receiptItems = document.getElementById('receiptItems');
            if (receiptItems) {
                receiptItems.innerHTML = '';
                
                cart.forEach(item => {
                    const row = document.createElement('div');
                    row.style = "display:flex; justify-content:space-between; margin-bottom:8px;";
                    row.innerHTML = `
                        <span>${item.quantity}x ${item.name}</span>
                        <span>RM ${(item.price * item.quantity).toFixed(2)}</span>
                    `;
                    receiptItems.appendChild(row);
                });
            }

            document.getElementById('receiptRef').textContent = "GG-" + Math.floor(1000 + Math.random() * 9000);
            document.getElementById('receiptMethod').textContent = method;
            const currentTotal = parseFloat(grandTotalEl.textContent.replace('RM ', ''));
            document.getElementById('receiptTotal').textContent = `RM ${(currentTotal + deliveryFee).toFixed(2)}`;
            
            document.getElementById('cartContent').style.display = 'none';
            document.getElementById('receiptSection').style.display = 'block';
            
            localStorage.removeItem('gg_cart');
            updateCartBadge(); 
        });
    }

    const yearSpan = document.getElementById('year');
    if(yearSpan) yearSpan.textContent = "2026"; 

    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('gg_cart')) || [];
        const badge = document.getElementById('cart-count');
        const badgeMobile = document.getElementById('cart-count-mobile');
        
        const totalItems = cart.reduce((t, i) => t + (i.quantity || 1), 0);
        
        if (badge) {
            if (totalItems > 0) {
                badge.textContent = `(${totalItems})`;
                badge.style.display = 'inline-block';
            } else { 
                badge.style.display = 'none'; 
            }
        }
        
        if (badgeMobile) {
            if (totalItems > 0) {
                badgeMobile.textContent = `(${totalItems})`;
                badgeMobile.style.display = 'inline-block';
            } else { 
                badgeMobile.style.display = 'none'; 
            }
        }
    }
});

function clearCart() {
    localStorage.removeItem('gg_cart');
    location.reload();
}
