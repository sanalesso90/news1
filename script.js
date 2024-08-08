// Initialize Lenis smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Get scroll value
let scrollY = 0;
lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
    scrollY = scroll;
});

// Integrate Lenis with GSAP
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Update ScrollTrigger
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Carousel functionality
    const carouselItems = document.querySelectorAll('.hero-carousel-item');
    let currentItem = 0;

    function nextItem() {
        carouselItems[currentItem].classList.remove('active');
        currentItem = (currentItem + 1) % carouselItems.length;
        carouselItems[currentItem].classList.add('active');
    }

    // Only start the carousel if there are items
    if (carouselItems.length > 0) {
        setInterval(nextItem, 3000);
    }

    // Parallax effect
    const heroSection = document.querySelector('.hero-section');
    const heroContent = document.querySelector('.hero-content');
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    lenis.on('scroll', () => {
        const scrollPosition = scrollY;
        const heroRect = heroSection.getBoundingClientRect();

        if (heroRect.bottom > 0) {
            heroContent.style.transform = `translateY(${scrollPosition * 0.5}px)`;
            heroTitle.style.transform = `translateY(${scrollPosition * 0.2}px)`;
            heroSubtitle.style.transform = `translateY(${scrollPosition * 0.1}px)`;
        }
    });

    // Mobile Navigation
    const mobileNav = document.querySelector('#mobile-nav');
    const menu = document.querySelector('#menu');
    const menuToggle = document.querySelector('.nav__toggle');
    let isMenuOpen = false;

    // TOGGLE MENU ACTIVE STATE
    menuToggle.addEventListener('click', e => {
        e.preventDefault();
        isMenuOpen = !isMenuOpen;

        // toggle a11y attributes and active class
        menuToggle.setAttribute('aria-expanded', String(isMenuOpen));
        menu.hidden = !isMenuOpen;
        mobileNav.classList.toggle('nav--open');
    });

    // TRAP TAB INSIDE NAV WHEN OPEN
    mobileNav.addEventListener('keydown', e => {
        // abort if menu isn't open or modifier keys are pressed
        if (!isMenuOpen || e.ctrlKey || e.metaKey || e.altKey) {
            return;
        }

        // listen for tab press and move focus
        // if we're on either end of the navigation
        const menuLinks = menu.querySelectorAll('.nav__link');
        if (e.keyCode === 9) {
            if (e.shiftKey) {
                if (document.activeElement === menuLinks[0]) {
                    menuToggle.focus();
                    e.preventDefault();
                }
            } else if (document.activeElement === menuToggle) {
                menuLinks[0].focus();
                e.preventDefault();
            }
        }
    });

    // GSAP ScrollTrigger for news section
    gsap.registerPlugin(ScrollTrigger);

    const newsSection = document.querySelector('.news-section');
    
    gsap.set(newsSection, { backgroundColor: '#000000' });

    gsap.to(newsSection, {
        backgroundColor: '#ffffff',
        scrollTrigger: {
            trigger: newsSection,
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
            onEnter: () => gsap.to(newsSection, { color: '#000000', duration: 0.5 }),
            onLeaveBack: () => gsap.to(newsSection, { color: '#ffffff', duration: 0.5 })
        }
    });

    // Fade in and slide up effect for news items
    gsap.utils.toArray('.news-item').forEach((item, i) => {
        gsap.from(item, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Cinematic Journeys Carousel
    const carouselData = [
        {
            thumbnailSrc: './img/trump9.jpeg',
            videoSrc: './video/video1.mp4',
            title: 'Nature Scenes',
            description: 'Breathtaking landscapes and wildlife.'
        },
        {
            thumbnailSrc: './img/trump6.jpeg',
            videoSrc: './video/video2.mp4',
            title: 'Urban Life',
            description: 'Hustle and bustle of city living.'
        },
        {
            thumbnailSrc: './img/trump10.jpeg',
            videoSrc: './video/video3.mp4',
            title: 'Tech Marvels',
            description: 'Latest advancements in technology.'
        },
        {
            thumbnailSrc: './img/trump7.jpeg',
            videoSrc: './video/video4.mp4',
            title: 'Culinary Delights',
            description: 'Gourmet dishes from around the world.'
        },
        {
            thumbnailSrc: './img/trump8.jpeg',
            videoSrc: './video/video1.mp4',
            title: 'Sports Action',
            description: 'Thrilling moments in various sports.'
        }
    ];

    const carousel = document.querySelector('.carousel');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    const fullscreenVideo = document.querySelector('.fullscreen-video');
    const fullscreenVideoElement = fullscreenVideo.querySelector('video');
    const closeBtn = document.querySelector('.close-btn');

    let currentIndex = 0;

    function createCarouselItem(item) {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');

        carouselItem.innerHTML = `
            <img src="${item.thumbnailSrc}" alt="${item.title}" class="carousel-item-thumbnail">
            <div class="play-button"></div>
            <div class="carousel-item-content">
                <h2 class="carousel-item-title">${item.title}</h2>
                <p class="carousel-item-description">${item.description}</p>
            </div>
        `;

        carouselItem.addEventListener('click', () => expandVideo(item.videoSrc));

        return carouselItem;
    }

    function populateCarousel() {
        // Add items twice to ensure infinite scroll
        carouselData.concat(carouselData).forEach((item) => {
            const carouselItem = createCarouselItem(item);
            carousel.appendChild(carouselItem);
        });
    }

    function moveCarousel(direction) {
        const itemWidth = carousel.querySelector('.carousel-item').offsetWidth + 20; // Include margin
        const totalItems = carousel.children.length;
        
        if (direction === 'next') {
            currentIndex++;
            if (currentIndex >= totalItems / 2) {
                currentIndex = 0;
                carousel.style.transition = 'none';
                carousel.style.transform = `translateX(0)`;
                // Force reflow
                carousel.offsetHeight;
                carousel.style.transition = 'transform 0.5s ease';
            }
        } else {
            currentIndex--;
            if (currentIndex < 0) {
                currentIndex = totalItems / 2 - 1;
                carousel.style.transition = 'none';
                carousel.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
                // Force reflow
                carousel.offsetHeight;
                carousel.style.transition = 'transform 0.5s ease';
            }
        }
        
        carousel.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }

    function expandVideo(videoSrc) {
        fullscreenVideoElement.src = videoSrc;
        fullscreenVideo.classList.add('active');
        fullscreenVideoElement.play();
    }

    function closeFullscreenVideo() {
        fullscreenVideo.classList.remove('active');
        setTimeout(() => {
            fullscreenVideoElement.pause();
            fullscreenVideoElement.src = '';
        }, 500); // Wait for transition to complete
    }

    prevBtn.addEventListener('click', () => moveCarousel('prev'));
    nextBtn.addEventListener('click', () => moveCarousel('next'));

    closeBtn.addEventListener('click', closeFullscreenVideo);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullscreenVideo.classList.contains('active')) {
            closeFullscreenVideo();
        }
    });

    populateCarousel();

    // GSAP animations for the Cinematic Journeys section
    gsap.from('.page-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
            trigger: '.page-container',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    gsap.from('.carousel-container', {
        opacity: 0,
        scale: 0.9,
        duration: 1,
        scrollTrigger: {
            trigger: '.carousel-container',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Animate carousel items
    gsap.utils.toArray('.carousel-item').forEach((item, i) => {
        gsap.from(item, {
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            }
        });
    });
});