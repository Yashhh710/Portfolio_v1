/* ═══════════════════════════════════════════════════════════════
   script.js — UI interactions for Yash Tambade Portfolio
═══════════════════════════════════════════════════════════════ */

// ── Track color image loading and show name card at 1-100% ────
const colourImg = document.getElementById('colour-img');
const nameCard = document.getElementById('name-card');

if (colourImg && nameCard) {
    // Hide card initially
    nameCard.style.opacity = '0';
    nameCard.style.visibility = 'hidden';

    // Fetch image with progress tracking
    fetch(colourImg.src)
        .then(response => {
            if (!response.body) {
                // If no body, just show the card
                nameCard.style.opacity = '1';
                nameCard.style.visibility = 'visible';
                return response.blob();
            }

            const reader = response.body.getReader();
            const contentLength = +response.headers.get('content-length');
            let receivedLength = 0;

            return new ReadableStream({
                start(controller) {
                    (function pump() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                controller.close();
                                // Keep visible when done
                                nameCard.style.opacity = '1';
                                nameCard.style.visibility = 'visible';
                                return;
                            }

                            receivedLength += value.length;
                            const percentComplete = (receivedLength / contentLength) * 100;

                            // Show card only when between 1-100%
                            if (percentComplete >= 1) {
                                nameCard.style.opacity = '1';
                                nameCard.style.visibility = 'visible';
                            } else {
                                nameCard.style.opacity = '0';
                                nameCard.style.visibility = 'hidden';
                            }

                            controller.enqueue(value);
                            pump();
                        });
                    })();
                }
            }).blob();
        })
        .catch(() => {
            // Show card even on error
            nameCard.style.opacity = '1';
            nameCard.style.visibility = 'visible';
        });
}

// ── Active nav link on scroll ──────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav a');

function updateActiveLink() {
    const scrollY = window.pageYOffset;
    sections.forEach(sec => {
        const top = sec.offsetTop - 80;
        const bot = top + sec.offsetHeight;
        const id = sec.getAttribute('id');
        const lnk = document.querySelector(`.nav a[href="#${id}"]`);
        if (lnk) lnk.classList.toggle('active', scrollY >= top && scrollY < bot);
    });
}
window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

// ── Contact form → Gmail ───────────────────────────────────────
const submitBtn = document.getElementById('submitBtn');
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        if (!name || !email || !message) { alert('Please fill all fields!'); return; }
        const recipient = 'yashtambade56@gmail.com';
        const subject = `Portfolio contact from ${name}`;
        const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        window.open(
            `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
            '_blank'
        );
    });
}

// ── Skills & About data ────────────────────────────────────────
const skillsData = [
    { name: 'Coding', level: 85 },
    { name: 'Logic', level: 80 },
    { name: 'Design', level: 78 },
    { name: 'Gaming', level: 75 },
    { name: 'Learning', level: 90 },
];

const aboutData = [
    'At a young age, I discovered my interest in web design, creative UI, and building digital projects.',
    'Through continuous learning and hands-on practice, coding has become a strong passion and part of my daily growth.',
    'Now, I am focused on improving my skills and taking on new challenges to grow as a web developer.',
];

// ── Render skills ──────────────────────────────────────────────
const skillsEl = document.getElementById('skills');
if (skillsEl) {
    skillsEl.innerHTML = skillsData.map(s => `
    <div class="sf-skill">
      <div style="width:90px;font-family:var(--font-hud);font-size:13px">${s.name}</div>
      <div class="sf-bar"><div class="sf-fill" data-level="${s.level}"></div></div>
    </div>`).join('');
    setTimeout(() => {
        document.querySelectorAll('.sf-fill').forEach(b => { b.style.width = b.dataset.level + '%'; });
    }, 600);
}

// ── Render about ───────────────────────────────────────────────
const aboutEl = document.getElementById('about');
const ageValueEl = document.getElementById('age-value');

function calculateAge(birthdate) {
    const [day, month, year] = birthdate.split('/').map(Number);
    const today = new Date();
    let age = today.getFullYear() - year;
    const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
    if (today < birthdayThisYear) age -= 1;
    return age;
}

if (ageValueEl) {
    ageValueEl.textContent = calculateAge('19/05/2008');
}

if (aboutEl) {
    aboutEl.innerHTML = `
    <div class="sf-row">
      <div class="sf-icon"><i data-lucide="user"></i></div>
      <div>${aboutData[0]}</div>
    </div>
    <div class="sf-row" style="justify-content:space-between">
      <div style="max-width:75%">${aboutData[1]}</div>
      <div class="sf-heart"><i data-lucide="heart"></i></div>
    </div>
    <div class="sf-row">
      <div class="sf-icon"><i data-lucide="rocket"></i></div>
      <div>${aboutData[2]}</div>
    </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ── Project card mouse-tilt ────────────────────────────────────
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const img = card.querySelector('img'); // Assuming there's an image inside the card
        // Skip parallax transforms for elements marked as non-parallax
        if (img.classList && img.classList.contains('no-parallax')) {
            img.style.transform = '';
            return;
        }
        card.style.transform = `translateY(-8px) rotate(1deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});


// ── Project scroll logic ─────────────────────────────────────
const projectsGrid = document.querySelector('.projects-grid');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (projectsGrid && prevBtn && nextBtn) {
    const scrollAmount = 400; // Increased for better movement

    prevBtn.addEventListener('click', () => {
        projectsGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        projectsGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // ── Center card scaling effect ─────────────────────────────
    const updateCenterCard = () => {
        const cards = document.querySelectorAll('.project-card');
        const gridRect = projectsGrid.getBoundingClientRect();
        const gridCenter = gridRect.left + gridRect.width / 2;

        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            
            // Calculate distance from center
            const distance = Math.abs(gridCenter - cardCenter);
            const maxDistance = gridRect.width / 2;
            
            // Scale based on proximity to center
            const scale = Math.max(0.85, 1 - distance / maxDistance * 0.3);
            const opacity = Math.max(0.6, 1 - distance / maxDistance * 0.5);
            
            // Check if card is centered (within tolerance)
            const isCentered = distance < cardRect.width / 2;
            card.classList.toggle('center', isCentered);
            
            if (!isCentered) {
                card.style.transform = `scale(${scale})`;
                card.style.opacity = opacity;
            } else {
                card.style.transform = 'scale(1.15)';
                card.style.opacity = '1';
            }
        });
    };

    // ── Auto-scroll to middle card on load ──────────────────────
    const scrollToMiddleCard = () => {
        const cards = document.querySelectorAll('.project-card:not(.add-project-card)');
        const totalCards = cards.length;
        
        // Calculate middle index
        let middleIndex;
        if (totalCards % 2 === 1) {
            // Odd number: take exact middle (0-indexed)
            middleIndex = Math.floor(totalCards / 2);
        } else {
            // Even number: take slightly left of middle
            middleIndex = Math.floor(totalCards / 2) - 1;
        }
        
        if (cards[middleIndex]) {
            const middleCard = cards[middleIndex];
            const cardLeft = middleCard.offsetLeft;
            const cardWidth = middleCard.offsetWidth;
            const containerWidth = projectsGrid.clientWidth;
            
            // Calculate scroll to center the card
            const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
            
            projectsGrid.scrollLeft = scrollPosition;
        }
    };

    // ── Click any card to scroll it to center ────────────────────
    const addCardClickHandlers = () => {
        const allCards = document.querySelectorAll('.project-card');
        allCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't scroll if clicking on a link
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    return;
                }
                
                const cardLeft = card.offsetLeft;
                const cardWidth = card.offsetWidth;
                const containerWidth = projectsGrid.clientWidth;
                
                // Calculate scroll to center the clicked card
                const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
                
                projectsGrid.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
            });
        });
    };

    projectsGrid.addEventListener('scroll', updateCenterCard, { passive: true });
    window.addEventListener('resize', updateCenterCard);
    
    // Initial update and scroll to middle
    setTimeout(() => {
        updateCenterCard();
        scrollToMiddleCard();
        addCardClickHandlers();
    }, 100);

    // Update button states while keeping the 3-box layout
    const updateButtons = () => {
        const { scrollLeft, scrollWidth, clientWidth } = projectsGrid;
        
        const isAtStart = scrollLeft <= 0;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;

        prevBtn.style.opacity = isAtStart ? '0.3' : '1';
        prevBtn.style.pointerEvents = isAtStart ? 'none' : 'all';
        prevBtn.style.filter = isAtStart ? 'grayscale(1)' : 'none';

        nextBtn.style.opacity = isAtEnd ? '0.3' : '1';
        nextBtn.style.pointerEvents = isAtEnd ? 'none' : 'all';
        nextBtn.style.filter = isAtEnd ? 'grayscale(1)' : 'none';
    };

    projectsGrid.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    updateButtons();
}

// 3d charector effect on scroll 
// 3d charector effect via slider
const slider = document.getElementById('image-slider');
const revealImg = document.getElementById('reveal-img');
// Disable glitch JS: keep variable but set to null so checks skip behavior
const glitchLayer = null;

if (slider && revealImg) {
    // Initial setup — keep colored image hidden at 0% (show blueprint only)
    revealImg.style.clipPath = `inset(100% 0% 0% 0%)`;
    revealImg.style.opacity = '0';

    // Create a non-linear/glitchy clip-path for a jagged reveal edge
    function generateGlitchyClipPath(progress) {
        const base = Math.max(0, 100 - progress);
        const segments = 9;
        const parts = [];
        for (let i = 0; i <= segments; i++) {
            const x = Math.round((i / segments) * 100);
            // variation decreases as progress increases (less jitter when nearly revealed)
            const jitter = Math.max(6, 24 - (progress / 100) * 20);
            const variation = (Math.random() - 0.5) * jitter;
            let y = base + variation;
            y = Math.max(0, Math.min(100, y));
            parts.push(`${x}% ${y}%`);
        }

        // polygon needs clockwise points; close the shape to bottom corners
        const poly = `polygon(0% 100%, ${parts.join(', ')}, 100% 100%)`;
        return poly;
    }

    slider.addEventListener('input', (e) => {
        const progress = e.target.value; // 0 to 100

        // Non-linear jagged reveal when progress > 0
        if (progress > 0) {
            revealImg.style.clipPath = generateGlitchyClipPath(progress);
            revealImg.style.opacity = '1';
        } else {
            // hide colored image at 0% and show only blueprint
            revealImg.style.clipPath = 'inset(100% 0% 0% 0%)';
            revealImg.style.opacity = '0';
        }
        
        // Update tooltip box: compute thumb position using bounding rects so it follows precisely
        const tooltip = document.getElementById('slider-tooltip');
        const wrapper = slider.closest('.slider-wrapper') || slider.parentElement;
        if (tooltip && wrapper) {
            tooltip.innerText = `${progress}%`;
            const sliderRect = slider.getBoundingClientRect();
            const wrapRect = wrapper.getBoundingClientRect();
            // position of thumb center relative to wrapper
            const thumbX = sliderRect.left + (progress / 100) * sliderRect.width;
            const leftRelative = thumbX - wrapRect.left;
            // clamp inside wrapper
            const padding = 6;
            const clamped = Math.min(Math.max(leftRelative, padding), wrapper.clientWidth - padding);
            tooltip.style.left = `${clamped}px`;
            tooltip.style.transform = 'translate(-50%, 0)';
        }

        if (glitchLayer) {
            if (progress > 0 && progress < 100 && Math.random() > 0.85) {
                glitchLayer.style.opacity = 0.2 + Math.random() * 0.3;
                glitchLayer.style.transform = `translate(-50%, -50%) translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 8}px)`;
            } else {
                glitchLayer.style.opacity = 0;
                glitchLayer.style.transform = 'translate(-50%, -50%)';
            }
        }
    });

    // Run once to position tooltip and ensure image visible on load
    slider.dispatchEvent(new Event('input'));

    slider.addEventListener('change', () => {
        if (glitchLayer) {
            glitchLayer.style.opacity = 0;
            glitchLayer.style.transform = 'translate(-50%, -50%)';
        }
    });
}


// ──  About Section - Scroll-based Card Reveal Animation ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const aboutSection = document.querySelector('#section2');
    const dataCards = document.querySelectorAll('.data-card');
    const sliderTooltip = document.getElementById('slider-tooltip');

    if (aboutSection && dataCards.length > 0) {
        window.addEventListener('scroll', () => {
            const aboutRect = aboutSection.getBoundingClientRect();
            const sectionTop = aboutRect.top;
            const sectionHeight = aboutRect.height;
            const windowHeight = window.innerHeight;
            
            // Calculate scroll progress (0-1) within the about section
            const scrollStart = windowHeight / 2;
            const scrollEnd = windowHeight - sectionHeight / 2;
            const progress = Math.max(0, Math.min(1, (scrollStart - sectionTop) / (scrollStart - scrollEnd)));
            const progressPercent = progress * 100;
            
            // Update slider tooltip
            if (sliderTooltip) {
                sliderTooltip.textContent = Math.round(progressPercent) + '%';
                sliderTooltip.style.setProperty('--val', progressPercent + '%');
            }
            
            // Card reveal logic
            dataCards.forEach((card) => {
                const cardClass = card.classList[1];
                
                if (cardClass === 'card-top-left' && progressPercent >= 5) {
                    // Name card
                    const cardProgress = Math.min(1, (progressPercent - 5) / 20);
                    card.style.opacity = cardProgress;
                    card.style.transform = `translate(${-20 + (cardProgress * 20)}px, 0) scale(${0.9 + (cardProgress * 0.1)})`;
                    
                } else if (cardClass === 'card-mid-left' && progressPercent >= 50) {
                    // Description card
                    const cardProgress = Math.min(1, (progressPercent - 50) / 25);
                    card.style.opacity = cardProgress;
                    card.style.transform = `translateY(${15 - (cardProgress * 15)}px)`;
                    
                } else if (cardClass === 'card-mid-right' && progressPercent >= 100) {
                    // Skills card
                    const cardProgress = Math.min(1, (progressPercent - 100) / 25);
                    card.style.opacity = cardProgress;
                    card.style.transform = `translateX(${-20 + (cardProgress * 20)}px)`;
                    
                } else if (progressPercent < 5 || (cardClass === 'card-mid-left' && progressPercent < 50) || (cardClass === 'card-mid-right' && progressPercent < 100)) {
                    card.style.opacity = 0;
                    card.style.transform = 'none';
                }
            });
        }, { passive: true });
    }
});

