// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const header = document.querySelector('.header');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            // Create mobile menu if it doesn't exist
            let mobileMenu = document.querySelector('.mobile-menu');

            if (!mobileMenu) {
                mobileMenu = document.createElement('div');
                mobileMenu.className = 'mobile-menu';
                mobileMenu.innerHTML = `
                    <div class="mobile-menu-content">
                        <button class="mobile-menu-close">
                            <i class="fas fa-times"></i>
                        </button>
                        <nav class="mobile-nav">
                            <ul>
                                <li><a href="#" class="mobile-nav-link">Cửa hàng</a></li>
                                <li><a href="#" class="mobile-nav-link">Voucher & Mã giảm giá</a></li>
                                <li><a href="#" class="mobile-nav-link">Ưu đãi hôm nay</a></li>
                                <li><a href="#" class="mobile-nav-link">Cách hoạt động</a></li>
                            </ul>
                        </nav>
                        <div class="mobile-actions">
                            <button class="btn btn-outline mobile-btn">Đăng nhập</button>
                            <button class="btn btn-primary mobile-btn">Đăng ký</button>
                        </div>
                    </div>
                `;
                header.appendChild(mobileMenu);

                // Add styles for mobile menu
                const mobileMenuStyles = document.createElement('style');
                mobileMenuStyles.textContent = `
                    .mobile-menu {
                        position: fixed;
                        top: 0;
                        left: -100%;
                        width: 80%;
                        max-width: 400px;
                        height: 100vh;
                        background: white;
                        box-shadow: 2px 0 10px rgba(0,0,0,0.1);
                        z-index: 2000;
                        transition: left 0.3s ease;
                    }

                    .mobile-menu.active {
                        left: 0;
                    }

                    .mobile-menu-content {
                        padding: 20px;
                    }

                    .mobile-menu-close {
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #333;
                    }

                    .mobile-nav ul {
                        list-style: none;
                        padding: 40px 0;
                    }

                    .mobile-nav li {
                        margin-bottom: 20px;
                    }

                    .mobile-nav-link {
                        color: #333;
                        text-decoration: none;
                        font-size: 18px;
                        font-weight: 500;
                    }

                    .mobile-actions {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }

                    .mobile-btn {
                        width: 100%;
                    }

                    @media (min-width: 992px) {
                        .mobile-menu {
                            display: none;
                        }
                    }
                `;
                document.head.appendChild(mobileMenuStyles);

                // Close mobile menu functionality
                const closeBtn = mobileMenu.querySelector('.mobile-menu-close');
                closeBtn.addEventListener('click', closeMobileMenu);

                // Close when clicking links
                const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
                mobileLinks.forEach(link => {
                    link.addEventListener('click', closeMobileMenu);
                });
            }

            // Toggle mobile menu
            mobileMenu.classList.toggle('active');

            // Prevent body scroll when menu is open
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    function closeMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!header.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });
});

// Store Card Hover Effect
const storeCards = document.querySelectorAll('.store-card');
storeCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.05)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Store Card Click Handler
storeCards.forEach(card => {
    card.addEventListener('click', function() {
        const storeName = this.querySelector('.store-info h3').textContent;
        console.log(`Clicked on ${storeName}`);
        // In a real application, this would navigate to the store page
        // window.location.href = `/store/${storeName.toLowerCase().replace(/\s+/g, '-')}`;
    });
});

// Category Card Animation
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.style.animation = 'fadeInUp 0.6s ease forwards';
    card.style.opacity = '0';

    // Add fadeInUp animation
    if (!document.querySelector('#fadeInUpAnimation')) {
        const style = document.createElement('style');
        style.id = 'fadeInUpAnimation';
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Scroll to Top Button
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopBtn.className = 'scroll-to-top';
document.body.appendChild(scrollToTopBtn);

// Add styles for scroll to top button
const scrollToTopStyles = document.createElement('style');
scrollToTopStyles.textContent = `
    .scroll-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #FF6B35, #FFB347);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(255, 107, 53, 0.3);
    }

    .scroll-to-top.visible {
        opacity: 1;
        visibility: visible;
    }

    .scroll-to-top:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(255, 107, 53, 0.4);
    }
`;
document.head.appendChild(scrollToTopStyles);

// Show/Hide scroll to top button based on scroll position
window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

// Scroll to top functionality
scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for animation
const sections = document.querySelectorAll('section');
sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Header scroll effect
const header = document.querySelector('.header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Hide/show header on scroll
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }

    lastScrollY = currentScrollY;
});

// Add header transition
if (header) {
    header.style.transition = 'transform 0.3s ease, background 0.3s ease';
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Stats Counter Animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = element.dataset.format.replace('{value}', target.toLocaleString());
            clearInterval(timer);
        } else {
            element.textContent = element.dataset.format.replace('{value}', Math.floor(start).toLocaleString());
        }
    }, 16);
}

// Initialize counters when visible
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            const value = parseInt(entry.target.dataset.value);
            animateCounter(entry.target, value);
        }
    });
}, { threshold: 0.5 });

// Setup stats
document.querySelectorAll('.stat-item h2').forEach(stat => {
    const text = stat.textContent;
    const value = parseInt(text.replace(/[^\d]/g, ''));

    if (value) {
        stat.dataset.value = value;
        stat.dataset.format = text.replace(value.toString(), '{value}');
        statsObserver.observe(stat);
    }
});

// Newsletter Signup (if needed)
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Cảm ơn bạn đã đăng ký!';
        successMessage.style.cssText = `
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            text-align: center;
            animation: fadeIn 0.5s ease;
        `;

        this.appendChild(successMessage);
        this.reset();

        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    });
}

// Add loading animation for buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        if (!this.classList.contains('no-loading')) {
            const originalContent = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            this.disabled = true;

            // Simulate loading (remove in production)
            setTimeout(() => {
                this.innerHTML = originalContent;
                this.disabled = false;
            }, 2000);
        }
    });
});

// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
    });
}