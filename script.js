/* ============================================================
   ILLESEUM - PRODUCTION-GRADE JAVASCRIPT
   Advanced animations, React components, performance-optimized
   ============================================================ */

'use strict';

// ============================================================
// 1. INITIALIZATION & CONFIGURATION
// ============================================================

const CONFIG = {
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024
    },
    animation: {
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
    },
    particles: {
        count: 30,
        speed: 2,
        size: 3
    }
};

// Global state
const appState = {
    isScrolling: false,
    isMobile: window.innerWidth < CONFIG.breakpoints.tablet,
    isReduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    cursorX: 0,
    cursorY: 0
};

// ============================================================
// 2. LENIS SMOOTH SCROLLING
// ============================================================

function initializeLenis() {
    if (appState.isReduced) return;
    
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2
    });
    
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);
    
    return lenis;
}

const lenis = initializeLenis();

// ============================================================
// 3. GSAP & SCROLL TRIGGER SETUP
// ============================================================

gsap.registerPlugin(ScrollTrigger);

// Sync Lenis with GSAP ScrollTrigger
if (!appState.isReduced && lenis) {
    gsap.ticker.add((time) => {
        ScrollTrigger.update();
    });
    
    gsap.ticker.remove(gsap.updateRoot);
    gsap.ticker.add(gsap.updateRoot);
}

// ============================================================
// 4. CUSTOM CURSOR
// ============================================================

class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.cursorDot = document.querySelector('.cursor-dot');
        this.isHovering = false;
        this.init();
    }
    
    init() {
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e), false);
        this.addHoverListeners();
    }
    
    handleMouseMove(e) {
        appState.cursorX = e.clientX;
        appState.cursorY = e.clientY;
        
        if (!appState.isReduced) {
            gsap.to(this.cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.5,
                overwrite: 'auto'
            });
            
            gsap.to(this.cursorDot, {
                x: e.clientX,
                y: e.clientY,
                duration: 0,
                overwrite: 'auto'
            });
        }
    }
    
    addHoverListeners() {
        const hoverElements = document.querySelectorAll('.btn, a, button, input, textarea');
        
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.cursor.style.borderColor = getComputedStyle(element).color || '#5a6e52';
                gsap.to(this.cursor, { scale: 1.5, duration: 0.3 });
            });
            
            element.addEventListener('mouseleave', () => {
                this.cursor.style.borderColor = '#2a5a3a';
                gsap.to(this.cursor, { scale: 1, duration: 0.3 });
            });
        });
    }
}

const customCursor = new CustomCursor();

// ============================================================
// 5. NAVIGATION
// ============================================================

class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }
    
    init() {
        // Hamburger toggle
        this.hamburger?.addEventListener('click', () => this.toggleMenu());
        
        // Close menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Scroll event
        window.addEventListener('scroll', () => this.handleScroll());
    }
    
    toggleMenu() {
        this.navMenu.classList.toggle('active');
        this.hamburger.setAttribute('aria-expanded', 
            this.navMenu.classList.contains('active') ? 'true' : 'false'
        );
    }
    
    closeMenu() {
        this.navMenu.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
    }
    
    handleScroll() {
        if (window.scrollY > 100) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
}

const navigation = new Navigation();

// ============================================================
// 6. PARTICLE SYSTEM
// ============================================================

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    createParticles() {
        for (let i = 0; i < CONFIG.particles.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * CONFIG.particles.size + 1,
                vx: (Math.random() - 0.5) * CONFIG.particles.speed,
                vy: (Math.random() - 0.5) * CONFIG.particles.speed,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = `rgba(90, 110, 82, 0.4)`;
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off walls
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Keep in bounds
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

const particleSystem = new ParticleSystem('particleCanvas');

// ============================================================
// 7. HERO SECTION ANIMATIONS
// ============================================================

function initHeroAnimations() {
    if (appState.isReduced) return;
    
    // Animate hero title with SplitType
    try {
        const titleSplits = document.querySelectorAll('.hero-title .split-text');
        titleSplits.forEach(element => {
            const split = new SplitType(element, { types: 'words, chars' });
            gsap.from(split.chars, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.02,
                ease: 'back.out',
                delay: 0.2
            });
        });
    } catch (e) {
        console.warn('SplitType not available');
    }
    
    // Animate hero subtitle
    gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.5,
        ease: 'power2.out'
    });
    
    // Animate buttons
    gsap.from('.hero-buttons .btn', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.2,
        delay: 0.7,
        ease: 'power2.out'
    });
}

// ============================================================
// 8. SCROLL ANIMATIONS
// ============================================================

function initScrollAnimations() {
    if (appState.isReduced) return;
    
    // About cards
    gsap.utils.toArray('.about-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'top 50%',
                scrub: 0.5
            },
            opacity: 0,
            y: 40,
            duration: 0.6
        });
    });
    
    // Facility cards
    gsap.utils.toArray('.facility-card').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%'
            },
            opacity: 0,
            y: 30,
            duration: 0.6
        });
    });
    
    // Class cards
    gsap.utils.toArray('.class-card').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%'
            },
            opacity: 0,
            x: -30,
            duration: 0.6,
            stagger: 0.1
        });
    });
    
    // Testimonial cards
    gsap.utils.toArray('.testimonial-card').forEach((card) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%'
            },
            opacity: 0,
            y: 40,
            duration: 0.6
        });
    });
    
    // Gallery items
    gsap.utils.toArray('.gallery-item').forEach((item) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%'
            },
            opacity: 0,
            scale: 0.9,
            duration: 0.6
        });
    });
    
    // Stats counter
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.dataset.target);
        gsap.from(stat, {
            scrollTrigger: {
                trigger: stat,
                start: 'top 80%'
            },
            textContent: 0,
            duration: 2,
            ease: 'power1.out',
            onUpdate: function() {
                stat.textContent = Math.floor(this.targets()[0].textContent);
            }
        });
    });
}

// ============================================================
// 9. SPLIT TEXT ANIMATIONS
// ============================================================

function initTextAnimations() {
    if (appState.isReduced) return;
    
    try {
        // Section titles
        document.querySelectorAll('.section-title').forEach(title => {
            const split = new SplitType(title, { types: 'words' });
            gsap.from(split.words, {
                scrollTrigger: {
                    trigger: title,
                    start: 'top 80%'
                },
                opacity: 0,
                y: 20,
                duration: 0.4,
                stagger: 0.05,
                ease: 'power2.out'
            });
        });
    } catch (e) {
        console.warn('SplitType initialization failed');
    }
}

// ============================================================
// 10. FAQ ACCORDION
// ============================================================

class FAQAccordion {
    constructor() {
        this.items = document.querySelectorAll('.faq-item');
        this.init();
    }
    
    init() {
        this.items.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            question.addEventListener('click', () => {
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                this.closeAll();
                
                if (!isExpanded) {
                    this.openItem(item, question, answer);
                }
            });
        });
    }
    
    openItem(item, question, answer) {
        question.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        
        if (!appState.isReduced) {
            gsap.from(answer, {
                opacity: 0,
                height: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    }
    
    closeAll() {
        this.items.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            question.setAttribute('aria-expanded', 'false');
            answer.hidden = true;
        });
    }
}

const faqAccordion = new FAQAccordion();

// ============================================================
// 11. CONTACT FORM HANDLING
// ============================================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        // Form validation
        const inputs = this.form.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.setAttribute('aria-invalid', 'true');
            } else {
                input.setAttribute('aria-invalid', 'false');
            }
        });
        
        if (isValid) {
            this.submitForm();
        }
    }
    
    submitForm() {
        // Simulate form submission
        const button = this.form.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        
        button.disabled = true;
        button.textContent = 'Sending...';
        
        setTimeout(() => {
            button.textContent = 'Message Sent!';
            gsap.to(button, { backgroundColor: '#2a5a3a', duration: 0.3 });
            
            setTimeout(() => {
                this.form.reset();
                button.disabled = false;
                button.textContent = originalText;
                gsap.to(button, { backgroundColor: '#5a6e52', duration: 0.3 });
            }, 2000);
        }, 1500);
    }
}

const contactForm = new ContactForm();

// ============================================================
// 12. INTERSECTION OBSERVER
// ============================================================

function initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('[data-observe]').forEach(el => {
        observer.observe(el);
    });
}

// ============================================================
// 13. REACT MEMBERSHIP COMPONENT
// ============================================================

const MembershipPlans = ({ React, ReactDOM }) => {
    const plans = [
        {
            id: 'silver',
            name: 'Silver',
            price: '₹2,999',
            period: '/month',
            badge: null,
            features: [
                'Gym Access (24/7)',
                'Basic Classes',
                'Equipment Access',
                'Locker Room',
                'Community Access',
                '1 Guest Pass/Month'
            ]
        },
        {
            id: 'gold',
            name: 'Gold',
            price: '₹4,999',
            period: '/month',
            badge: 'POPULAR',
            features: [
                'All Silver Benefits',
                '4 Personal Training Sessions',
                'Nutrition Consultation',
                'Recovery Lounge Access',
                'Priority Class Booking',
                '2 Guest Passes/Month',
                'Fitness Assessment'
            ]
        },
        {
            id: 'platinum',
            name: 'Platinum',
            price: '₹7,999',
            period: '/month',
            badge: null,
            features: [
                'All Gold Benefits',
                '8 Personal Training Sessions',
                'Sports Court Access',
                'Spa & Sauna Included',
                'Monthly Wellness Coaching',
                '4 Guest Passes/Month',
                'Priority Everything'
            ]
        },
        {
            id: 'diamond',
            name: 'Diamond',
            price: '₹12,999',
            period: '/month',
            badge: 'ELITE',
            features: [
                'All Platinum Benefits',
                'Unlimited Personal Training',
                'All Facilities Access',
                'Concierge Service',
                'Private Training Hours',
                'Complimentary Childcare',
                'VIP Events Access'
            ]
        }
    ];
    
    return (
        <div className="membership-grid">
            {plans.map((plan, index) => (
                <div key={plan.id} className={`membership-card ${plan.badge ? 'featured' : ''}`}>
                    {plan.badge && (
                        <span className="membership-badge">{plan.badge}</span>
                    )}
                    <h3 style={{ marginBottom: '1rem' }}>{plan.name}</h3>
                    <div className="membership-price">{plan.price}</div>
                    <p className="membership-period">{plan.period}</p>
                    <ul className="membership-features">
                        {plan.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                        ))}
                    </ul>
                    <button className="btn btn-primary" style={{ width: '100%' }}>
                        Choose Plan
                    </button>
                </div>
            ))}
        </div>
    );
};

// ============================================================
// 14. REACT MOUNTING
// ============================================================

function mountReactComponents() {
    try {
        const membershipContainer = document.getElementById('membership-container');
        if (membershipContainer) {
            const root = ReactDOM.createRoot(membershipContainer);
            root.render(
                <MembershipPlans React={React} ReactDOM={ReactDOM} />
            );
        }
    } catch (error) {
        console.error('React mounting failed:', error);
    }
}

// ============================================================
// 15. DEBOUNCE & THROTTLE UTILITIES
// ============================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================================
// 16. WINDOW RESIZE HANDLER
// ============================================================

const handleResize = debounce(() => {
    appState.isMobile = window.innerWidth < CONFIG.breakpoints.tablet;
}, 250);

window.addEventListener('resize', handleResize);

// ============================================================
// 17. MAGNETIC BUTTON EFFECT
// ============================================================

class MagneticButton {
    constructor(button) {
        this.button = button;
        this.x = 0;
        this.y = 0;
        this.init();
    }
    
    init() {
        this.button.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.button.addEventListener('mouseleave', () => this.handleMouseLeave());
    }
    
    handleMouseMove(e) {
        const rect = this.button.getBoundingClientRect();
        const buttonX = rect.left + rect.width / 2;
        const buttonY = rect.top + rect.height / 2;
        
        this.x = e.clientX - buttonX;
        this.y = e.clientY - buttonY;
        
        const distance = Math.sqrt(this.x ** 2 + this.y ** 2);
        
        if (distance < 100 && !appState.isReduced) {
            const move = Math.min(distance / 10, 10);
            gsap.to(this.button, {
                x: (this.x / distance) * move,
                y: (this.y / distance) * move,
                duration: 0.3
            });
        }
    }
    
    handleMouseLeave() {
        if (!appState.isReduced) {
            gsap.to(this.button, {
                x: 0,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    }
}

// Apply magnetic effect to all buttons
document.querySelectorAll('.btn').forEach(button => {
    new MagneticButton(button);
});

// ============================================================
// 18. CARD TILT EFFECT
// ============================================================

class CardTilt {
    constructor(card) {
        this.card = card;
        this.init();
    }
    
    init() {
        this.card.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.card.addEventListener('mouseleave', () => this.handleMouseLeave());
    }
    
    handleMouseMove(e) {
        if (appState.isReduced) return;
        
        const rect = this.card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        gsap.to(this.card, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformOrigin: 'center center',
            transformStyle: 'preserve-3d',
            duration: 0.3
        });
    }
    
    handleMouseLeave() {
        if (appState.isReduced) return;
        
        gsap.to(this.card, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
    }
}

// Apply tilt to cards
document.querySelectorAll('.about-card, .testimonial-card, .class-card').forEach(card => {
    new CardTilt(card);
});

// ============================================================
// 19. INITIALIZATION SEQUENCE
// ============================================================

function initializeApp() {
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initApp();
        });
    } else {
        initApp();
    }
}

function initApp() {
    // Sequential initialization with error handling
    try {
        mountReactComponents();
    } catch (error) {
        console.warn('React initialization skipped:', error);
    }
    
    try {
        initHeroAnimations();
    } catch (error) {
        console.warn('Hero animations failed:', error);
    }
    
    try {
        initScrollAnimations();
    } catch (error) {
        console.warn('Scroll animations failed:', error);
    }
    
    try {
        initTextAnimations();
    } catch (error) {
        console.warn('Text animations failed:', error);
    }
    
    try {
        initIntersectionObserver();
    } catch (error) {
        console.warn('IntersectionObserver failed:', error);
    }
    
    // Performance monitoring
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
            const perfTiming = performance.timing;
            const pageLoadTime = perfTiming.loadEventEnd - perfTiming.navigationStart;
            console.log(`Page load time: ${pageLoadTime}ms`);
        });
    }
}

initializeApp();

// ============================================================
// 20. ACCESSIBILITY ENHANCEMENTS
// ============================================================

// Focus visible styles for keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// ============================================================
// 21. PERFORMANCE OPTIMIZATION
// ============================================================

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    // Cleanup GSAP instances
    gsap.globalTimeline.clear();
    
    // Cleanup event listeners if needed
    if (lenis) {
        lenis.destroy();
    }
});

// Request animation frame for smooth updates
let animationFrameId;

const animate = () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        return;
    }
    
    animationFrameId = requestAnimationFrame(animate);
};

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
    } else {
        animate();
    }
});

animate();

// ============================================================
// 22. LAZY LOADING IMAGES
// ============================================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================================
// 23. SCROLL SPY
// ============================================================

class ScrollSpy {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', throttle(() => this.updateActiveLink(), 100));
    }
    
    updateActiveLink() {
        let currentSection = '';
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 200) {
                currentSection = section.getAttribute('id');
            }
        });
        
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
}

const scrollSpy = new ScrollSpy();

console.log('%cILLESEUM Website Initialized', 'color: #5a6e52; font-size: 16px; font-weight: bold;');
