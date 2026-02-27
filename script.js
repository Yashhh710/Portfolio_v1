/* ═══════════════════════════════════════════════════════════════
   script.js — UI interactions for Yash Tambade Portfolio
═══════════════════════════════════════════════════════════════ */

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
        card.style.transform = `translateY(-8px) rotate(1deg) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});


// text

