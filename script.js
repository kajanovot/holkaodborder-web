const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
const hamburger = document.querySelector('.hamburger');
const siteNav = document.querySelector('.site-nav');
const root = document.documentElement;
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let lastScrollY = window.pageYOffset;
let ticking = false;

if (menuToggle && menu && hamburger) {
    menuToggle.addEventListener('click', function() {
        menu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', function() {
            menu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

const scrollFloatElements = document.querySelectorAll(
    '.training-item, .benefit-item, .review-item, .login-form, #member-content, .contact-panel, .contact-form'
);

scrollFloatElements.forEach((element, index) => {
    element.classList.add('scroll-float');
    element.style.setProperty('--float-delay', `${index * 35}ms`);
});

function updateScrollEffects() {
    const parallax = document.querySelector('.parallax');
    const scrolled = window.pageYOffset;
    const direction = scrolled > lastScrollY ? 'down' : 'up';
    const heroContent = document.querySelector('#uvod .content');
    const heroProgress = Math.min(scrolled / Math.max(window.innerHeight, 1), 1);
    const rate = scrolled * 0.28;

    if (siteNav) {
        siteNav.classList.toggle('scrolled', scrolled > 24);
        siteNav.classList.toggle('nav-hidden', direction === 'down' && scrolled > 220 && menu && !menu.classList.contains('active'));
    }

    document.body.classList.toggle('scrolling-down', direction === 'down');
    document.body.classList.toggle('scrolling-up', direction === 'up');
    root.style.setProperty('--page-scroll', `${scrolled * -0.035}px`);

    if (parallax && !motionQuery.matches) {
        parallax.style.transform = `translateY(${rate}px)`;
    }

    if (heroContent && !motionQuery.matches) {
        heroContent.style.setProperty('--hero-shift', `${scrolled * -0.12}px`);
        heroContent.style.setProperty('--hero-opacity', `${1 - heroProgress * 0.45}`);
    }

    if (!motionQuery.matches) {
        scrollFloatElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const distance = (elementCenter - viewportCenter) / viewportCenter;
            const clamped = Math.max(-1, Math.min(1, distance));
            const speed = element.classList.contains('training-item') ? 18 : 12;

            element.style.setProperty('--scroll-y', `${clamped * speed}px`);
            element.style.setProperty('--scroll-tilt', `${clamped * -0.35}deg`);
        });
    }

    lastScrollY = scrolled;
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(updateScrollEffects);
        ticking = true;
    }
});

const heroVideo = document.querySelector('#myVideo');
if (heroVideo) {
    heroVideo.addEventListener('loadedmetadata', function() {
        window.dispatchEvent(new Event('scroll'));
    });
}

function reveal() {
    const reveals = document.querySelectorAll('.reveal, .dog-profile');

    if (!('IntersectionObserver' in window)) {
        reveals.forEach(element => element.classList.add('active'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                entry.target.classList.remove('leaving');

                if (entry.target.classList.contains('dog-profile')) {
                    const paragraphs = entry.target.querySelectorAll('p');
                    paragraphs.forEach((p, index) => {
                        p.style.transitionDelay = `${0.2 * index}s`;
                        p.style.opacity = '0';
                        p.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            p.style.opacity = '1';
                            p.style.transform = 'translateY(0)';
                        }, 100 * index);
                    });
                }
            } else {
                entry.target.classList.remove('active');
                entry.target.classList.add('leaving');
            }
        });
    }, {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px'
    });

    reveals.forEach(element => observer.observe(element));
}

window.addEventListener('load', function() {
    reveal();
    updateScrollEffects();
});
window.addEventListener('resize', updateScrollEffects);

document.querySelectorAll('.dog-image').forEach(container => {
    container.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = container.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        const img = container.querySelector('img');

        if (img) {
            img.style.transform = `
                rotateY(${x * 20}deg)
                rotateX(${-y * 20}deg)
                translateZ(50px)
            `;
        }
    });

    container.addEventListener('mouseleave', () => {
        const img = container.querySelector('img');
        if (img) {
            img.style.transform = 'rotateY(10deg) translateZ(0)';
        }
    });
});

window.showLoginForm = function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetForm = document.getElementById('reset-password-form');

    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (resetForm) resetForm.style.display = 'none';
};

window.showRegisterForm = function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetForm = document.getElementById('reset-password-form');

    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (resetForm) resetForm.style.display = 'none';
};

window.showResetForm = function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetForm = document.getElementById('reset-password-form');

    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'none';
    if (resetForm) resetForm.style.display = 'block';
};

document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;

    const reviewsContainer = document.getElementById('reviews');
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');
    const status = reviewForm.querySelector('.form-status');
    const submitButton = reviewForm.querySelector('button[type="submit"]');

    function setReviewStatus(message, type) {
        if (!status) return;
        status.textContent = message;
        status.classList.remove('success', 'error');
        if (type) status.classList.add(type);
    }

    function renderReview(review, prepend = false) {
        if (!reviewsContainer) return;

        const reviewItem = document.createElement('div');
        const reviewName = document.createElement('h3');
        const reviewRating = document.createElement('p');
        const reviewText = document.createElement('p');

        reviewItem.className = 'review-item';
        reviewName.textContent = review.name;
        reviewRating.textContent = `Hodnocení: ${'★'.repeat(Number(review.rating))}`;
        reviewText.textContent = review.review;

        reviewItem.append(reviewName, reviewRating, reviewText);

        if (prepend && reviewsContainer.firstChild) {
            reviewsContainer.insertBefore(reviewItem, reviewsContainer.firstChild);
        } else {
            reviewsContainer.appendChild(reviewItem);
        }
    }

    async function loadPublicReviews() {
        if (!reviewsContainer) return;

        try {
            const response = await fetch('/api/reviews', {
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) return;

            const result = await response.json();
            reviewsContainer.innerHTML = '';

            if (!result.reviews || result.reviews.length === 0) {
                const empty = document.createElement('p');
                empty.className = 'empty-reviews';
                empty.textContent = 'Zatím tu nejsou žádné veřejné recenze. Buďte první, kdo ji napíše.';
                reviewsContainer.appendChild(empty);
                return;
            }

            result.reviews.forEach(review => renderReview(review));
        } catch (error) {
            setReviewStatus('Recenze se teď nepodařilo načíst.', 'error');
        }
    }

    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            if (ratingInput) ratingInput.value = value;

            stars.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');

            let previousSibling = this.previousElementSibling;
            while (previousSibling) {
                previousSibling.classList.add('selected');
                previousSibling = previousSibling.previousElementSibling;
            }
        });
    });

    reviewForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(reviewForm);
        const rating = ratingInput ? ratingInput.value : '0';
        const gdpr = document.getElementById('gdpr').checked;
        const token = formData.get('cf-turnstile-response');

        if (rating === '0') {
            setReviewStatus('Prosím, zvolte hodnocení.', 'error');
            return;
        }

        if (!gdpr) {
            setReviewStatus('Prosím, souhlaste se zpracováním osobních údajů.', 'error');
            return;
        }

        if (!token) {
            setReviewStatus('Prosím, potvrďte bezpečnostní ověření.', 'error');
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Odesílám...';
        }

        setReviewStatus('Odesílám recenzi...', null);

        try {
            const response = await fetch(reviewForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json'
                }
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.message || 'Recenzi se nepodařilo odeslat.');
            }

            if (reviewsContainer) {
                const empty = reviewsContainer.querySelector('.empty-reviews');
                if (empty) empty.remove();
            }

            renderReview(result.review, true);
            reviewForm.reset();
            stars.forEach(s => s.classList.remove('selected'));
            if (ratingInput) ratingInput.value = '0';
            if (window.turnstile) window.turnstile.reset();
            setReviewStatus('Děkuji, recenze je veřejně přidaná.', 'success');
        } catch (error) {
            setReviewStatus(error.message || 'Recenzi se nepodařilo odeslat.', 'error');
            if (window.turnstile) window.turnstile.reset();
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Odeslat recenzi';
            }
        }
    });

    loadPublicReviews();
});

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const status = contactForm.querySelector('.form-status');
    const submitButton = contactForm.querySelector('button[type="submit"]');

    function setStatus(message, type) {
        if (!status) return;
        status.textContent = message;
        status.classList.remove('success', 'error');
        if (type) status.classList.add(type);
    }

    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const token = formData.get('cf-turnstile-response');

        if (!token) {
            setStatus('Prosím, potvrďte bezpečnostní ověření.', 'error');
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Odesílám...';
        }

        setStatus('Odesílám zprávu...', null);

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json'
                }
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.message || 'Zprávu se nepodařilo odeslat.');
            }

            contactForm.reset();
            if (window.turnstile) {
                window.turnstile.reset();
            }
            setStatus('Děkuji, zpráva byla odeslána. Ozvu se co nejdřív.', 'success');
        } catch (error) {
            setStatus(error.message || 'Zprávu se nepodařilo odeslat. Zkuste to prosím později.', 'error');
            if (window.turnstile) {
                window.turnstile.reset();
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Odeslat zprávu';
            }
        }
    });
});
