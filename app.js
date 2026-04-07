/* ============================================
   IRTC — App.js
   3D Train Scene, Chatbot, and Interactions
   ============================================ */

// ─── Preloader ─────────────────────────────
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
        initAnimations();
    }, 2000);
});

// ─── Navigation ────────────────────────────
const navbar = document.getElementById('navbar');
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
const allNavLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Back to top visibility
    const backToTop = document.getElementById('backToTop');
    backToTop.classList.toggle('visible', window.scrollY > 500);

    // Active nav link based on scroll
    const sections = document.querySelectorAll('section');
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    allNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
});

allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// Back to top
document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── 3D Train Scene (Three.js) ─────────────
function init3DScene() {
    const canvas = document.getElementById('trainCanvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x4466ff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x88aaff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x2563eb, 1.5, 50);
    pointLight1.position.set(-10, 5, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7c3aed, 1, 50);
    pointLight2.position.set(10, 3, -5);
    scene.add(pointLight2);

    // === Build Train ===
    const trainGroup = new THREE.Group();

    // Main body material
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0x1e40af,
        shininess: 100,
        specular: 0x4488ff
    });

    const accentMaterial = new THREE.MeshPhongMaterial({
        color: 0x2563eb,
        shininess: 120,
        specular: 0x88bbff
    });

    const windowMaterial = new THREE.MeshPhongMaterial({
        color: 0x60a5fa,
        shininess: 200,
        specular: 0xffffff,
        emissive: 0x1e40af,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.7
    });

    const wheelMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 60,
        specular: 0x666666
    });

    const stripeMaterial = new THREE.MeshPhongMaterial({
        color: 0xf97316,
        shininess: 100,
        emissive: 0xf97316,
        emissiveIntensity: 0.2
    });

    const headlightMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0xffffcc,
        emissiveIntensity: 1,
        shininess: 200
    });

    // --- Locomotive ---
    // Main body
    const locoBody = new THREE.Mesh(
        new THREE.BoxGeometry(6, 2.2, 2.5),
        bodyMaterial
    );
    locoBody.position.set(0, 1.8, 0);
    trainGroup.add(locoBody);

    // Nose (aerodynamic front)
    const noseGeometry = new THREE.CylinderGeometry(0.6, 1.25, 3, 8, 1, false, 0, Math.PI);
    const nose = new THREE.Mesh(noseGeometry, accentMaterial);
    nose.rotation.set(0, 0, Math.PI / 2);
    nose.position.set(4.2, 1.8, 0);
    trainGroup.add(nose);

    // Nose bottom
    const noseBottom = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.8, 2.5),
        bodyMaterial
    );
    noseBottom.position.set(3.5, 1.05, 0);
    trainGroup.add(noseBottom);

    // Cab (roof section)
    const cab = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.8, 2.3),
        accentMaterial
    );
    cab.position.set(-0.5, 3.2, 0);
    trainGroup.add(cab);

    // Cab roof (rounded)
    const cabRoof = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.15, 4, 16, 1, false, 0, Math.PI),
        accentMaterial
    );
    cabRoof.rotation.set(0, 0, Math.PI / 2);
    cabRoof.position.set(-0.5, 3.5, 0);
    trainGroup.add(cabRoof);

    // Windshield
    const windshield = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 1),
        windowMaterial
    );
    windshield.position.set(1.55, 2.6, 0);
    windshield.rotation.y = 0;
    windshield.rotation.z = -0.15;
    trainGroup.add(windshield);

    // Side windows (locomotive)
    for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 3; i++) {
            const win = new THREE.Mesh(
                new THREE.PlaneGeometry(0.8, 0.6),
                windowMaterial
            );
            win.position.set(-0.5 + i * 1.5 - 1, 2.5, side * 1.26);
            win.rotation.y = side > 0 ? 0 : Math.PI;
            trainGroup.add(win);
        }
    }

    // Orange stripe along body
    const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.15, 2.55),
        stripeMaterial
    );
    stripe.position.set(0.5, 1.5, 0);
    trainGroup.add(stripe);

    // Headlights
    for (let side = -1; side <= 1; side += 2) {
        const headlight = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 16, 16),
            headlightMaterial
        );
        headlight.position.set(5.1, 1.6, side * 0.6);
        trainGroup.add(headlight);

        // Headlight glow
        const glowLight = new THREE.PointLight(0xffffcc, 0.5, 8);
        glowLight.position.set(5.5, 1.6, side * 0.6);
        trainGroup.add(glowLight);
    }

    // Undercarriage
    const undercarriage = new THREE.Mesh(
        new THREE.BoxGeometry(7, 0.5, 2.8),
        new THREE.MeshPhongMaterial({ color: 0x1a1a2e, shininess: 30 })
    );
    undercarriage.position.set(0.5, 0.45, 0);
    trainGroup.add(undercarriage);

    // Wheels (locomotive)
    const wheelPositions = [-2, 0, 2, 3.5];
    wheelPositions.forEach(xPos => {
        for (let side = -1; side <= 1; side += 2) {
            const wheel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.4, 0.15, 24),
                wheelMaterial
            );
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(xPos, 0.4, side * 1.4);
            trainGroup.add(wheel);

            // Hub
            const hub = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 0.2, 12),
                new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 100 })
            );
            hub.rotation.x = Math.PI / 2;
            hub.position.set(xPos, 0.4, side * 1.45);
            trainGroup.add(hub);
        }
    });

    // --- Passenger Cars (2 cars) ---
    for (let car = 0; car < 2; car++) {
        const carOffset = -(car + 1) * 7.5;
        const carGroup = new THREE.Group();

        // Car body
        const carBody = new THREE.Mesh(
            new THREE.BoxGeometry(6.5, 2.2, 2.5),
            car === 0 ? bodyMaterial : accentMaterial
        );
        carBody.position.set(0, 1.8, 0);
        carGroup.add(carBody);

        // Car roof
        const carRoof = new THREE.Mesh(
            new THREE.CylinderGeometry(1.15, 1.25, 6.5, 16, 1, false, 0, Math.PI),
            new THREE.MeshPhongMaterial({ color: car === 0 ? 0x1e3a8a : 0x1d4ed8, shininess: 80 })
        );
        carRoof.rotation.set(0, 0, Math.PI / 2);
        carRoof.position.set(0, 2.9, 0);
        carGroup.add(carRoof);

        // Orange stripe
        const carStripe = new THREE.Mesh(
            new THREE.BoxGeometry(6.6, 0.15, 2.55),
            stripeMaterial
        );
        carStripe.position.set(0, 1.5, 0);
        carGroup.add(carStripe);

        // Windows
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 5; i++) {
                const win = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.7, 0.7),
                    windowMaterial
                );
                win.position.set(-2.4 + i * 1.2, 2.3, side * 1.26);
                win.rotation.y = side > 0 ? 0 : Math.PI;
                carGroup.add(win);
            }
        }

        // Car undercarriage
        const carUnder = new THREE.Mesh(
            new THREE.BoxGeometry(6.8, 0.5, 2.8),
            new THREE.MeshPhongMaterial({ color: 0x1a1a2e, shininess: 30 })
        );
        carUnder.position.set(0, 0.45, 0);
        carGroup.add(carUnder);

        // Wheels
        const carWheelPos = [-2.5, -1, 1, 2.5];
        carWheelPos.forEach(xPos => {
            for (let side = -1; side <= 1; side += 2) {
                const wheel = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.4, 0.4, 0.15, 24),
                    wheelMaterial
                );
                wheel.rotation.x = Math.PI / 2;
                wheel.position.set(xPos, 0.4, side * 1.4);
                carGroup.add(wheel);
            }
        });

        // Coupler connection
        const coupler = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.3, 0.3),
            wheelMaterial
        );
        coupler.position.set(3.7, 0.7, 0);
        carGroup.add(coupler);

        carGroup.position.x = carOffset;
        trainGroup.add(carGroup);
    }

    // --- Railway Tracks ---
    const trackGroup = new THREE.Group();

    // Rails
    for (let side = -1; side <= 1; side += 2) {
        const rail = new THREE.Mesh(
            new THREE.BoxGeometry(100, 0.08, 0.1),
            new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 150 })
        );
        rail.position.set(0, 0.04, side * 1.2);
        trackGroup.add(rail);
    }

    // Sleepers (ties)
    for (let i = -50; i < 50; i++) {
        const sleeper = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.06, 3),
            new THREE.MeshPhongMaterial({ color: 0x4a3728 })
        );
        sleeper.position.set(i * 1, 0, 0);
        trackGroup.add(sleeper);
    }

    // Ballast (ground under tracks)
    const ballast = new THREE.Mesh(
        new THREE.BoxGeometry(100, 0.1, 3.5),
        new THREE.MeshPhongMaterial({ color: 0x2a2a3e, shininess: 10 })
    );
    ballast.position.set(0, -0.05, 0);
    trackGroup.add(ballast);

    scene.add(trackGroup);
    trainGroup.position.set(0, 0, 0);
    scene.add(trainGroup);

    // --- Particles (Stars/Atmosphere) ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 600;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 100;
        posArray[i + 1] = (Math.random() - 0.5) * 50 + 15;
        posArray[i + 2] = (Math.random() - 0.5) * 60 - 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.12,
        color: 0x6688ff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Camera position
    camera.position.set(10, 6, 12);
    camera.lookAt(0, 1.5, 0);

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Animation loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.008;

        // Smooth mouse follow
        mouseX += (targetMouseX - mouseX) * 0.03;
        mouseY += (targetMouseY - mouseY) * 0.03;

        // Train gentle floating motion
        trainGroup.position.y = Math.sin(time * 0.8) * 0.1;
        trainGroup.rotation.y = Math.sin(time * 0.3) * 0.02;

        // Camera orbit influenced by mouse
        const baseAngle = time * 0.15;
        const radius = 16;
        camera.position.x = Math.cos(baseAngle) * radius + mouseX * 3;
        camera.position.z = Math.sin(baseAngle) * radius;
        camera.position.y = 5 + mouseY * 1.5 + Math.sin(time * 0.5) * 0.5;
        camera.lookAt(0, 1.5, 0);

        // Rotate particles slowly
        particles.rotation.y += 0.0003;
        particles.rotation.x += 0.0001;

        // Animate wheel rotation
        trainGroup.children.forEach(child => {
            if (child.geometry && child.geometry.type === 'CylinderGeometry') {
                if (child.geometry.parameters.radiusTop === 0.4) {
                    child.rotation.z += 0.04;
                }
            }
        });

        // Pulsing point lights
        pointLight1.intensity = 1.5 + Math.sin(time * 2) * 0.3;
        pointLight2.intensity = 1 + Math.sin(time * 2.5 + 1) * 0.3;

        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

init3DScene();

// ─── Scroll Animations ────────────────────
function initAnimations() {
    // Counter animation
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current).toLocaleString();
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target.toLocaleString();
                    }
                };
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));

    // Fade-in elements
    const fadeElements = document.querySelectorAll('.feature-card, .step-card, .section-header');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up', 'visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    fadeElements.forEach(el => fadeObserver.observe(el));
}

// ─── Chatbot (Gemini) ─────────────────────
const GEMINI_MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest'
];
const GEMINI_ENDPOINTS = ['v1', 'v1beta'];
const GEMINI_KEY_STORAGE = 'irtc_gemini_api_key';
let cachedResolvedModels = null;

function getGeminiApiKey() {
    if (typeof window.GEMINI_API_KEY === 'string' && window.GEMINI_API_KEY.trim()) {
        return window.GEMINI_API_KEY.trim();
    }
    try {
        const stored = localStorage.getItem(GEMINI_KEY_STORAGE);
        return stored ? stored.trim() : '';
    } catch {
        return '';
    }
}

function setStoredGeminiKey(key) {
    try {
        if (key && key.trim()) {
            localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
        } else {
            localStorage.removeItem(GEMINI_KEY_STORAGE);
        }
    } catch {
        /* private mode / blocked storage */
    }
}

function geminiApiUrl(model, version) {
    const key = getGeminiApiKey();
    return `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
}

async function resolveAvailableGeminiModels() {
    if (Array.isArray(cachedResolvedModels) && cachedResolvedModels.length) {
        return cachedResolvedModels;
    }

    const key = getGeminiApiKey();
    if (!key) return GEMINI_MODELS;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
        if (!response.ok) return GEMINI_MODELS;

        const data = await response.json();
        const models = (data.models || [])
            .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
            .map((m) => (m.name || '').replace(/^models\//, ''))
            .filter((name) => name && name.includes('gemini') && name.includes('flash'));

        const deduped = [...new Set([...models, ...GEMINI_MODELS])];
        cachedResolvedModels = deduped.length ? deduped : GEMINI_MODELS;
        return cachedResolvedModels;
    } catch {
        return GEMINI_MODELS;
    }
}

function syncApiKeyBannerUi() {
    const banner = document.getElementById('apiKeyBanner');
    const statusEl = document.getElementById('apiKeyStatus');
    const inputEl = document.getElementById('apiKeyInput');
    if (!banner || !statusEl) return;

    const hasKey = Boolean(getGeminiApiKey());
    banner.classList.toggle('api-key-banner--ready', hasKey);
    statusEl.textContent = hasKey
        ? 'API key is saved on this device. You can chat below.'
        : '';
    if (inputEl && hasKey) inputEl.value = '';
}

function formatGeminiError(err, responseStatus, apiMessage) {
    const msg = (apiMessage || '').toLowerCase();

    if (responseStatus === 403 || msg.includes('permission_denied') || msg.includes('api key')) {
        return [
            '### 🔐 Access Denied (403)',
            'Your API key is restricted or invalid for this specific domain.',
            '**How to fix:**',
            '1. Go to [Google AI Studio](https://aistudio.google.com/apikey).',
            '2. Find your API key → click **Edit**.',
            '3. Under **Application restrictions**, select **None** (for testing) or add an **HTTP referrer**:',
            '   `https://nithin2026-stack.github.io/*`',
            '4. Save changes and wait 2 minutes before retrying.',
            '',
            '*Technical detail: ' + (apiMessage || 'Forbidden') + '*'
        ].join('\n\n');
    }

    if (responseStatus === 429 || msg.includes('quota') || msg.includes('rate limit')) {
        return [
            '### ⏳ Quota Exceeded (429)',
            'You have reached the free-tier limit for this model.',
            '**Wait 60 seconds** and try again. If it persists, keep only valid flash models in `app.js` (for example `gemini-2.0-flash` or `gemini-1.5-flash`).',
            '',
            '*Technical detail: ' + (apiMessage || 'Too Many Requests') + '*'
        ].join('\n\n');
    }

    if (responseStatus === 400 && (msg.includes('location') || msg.includes('country'))) {
        return '### 🌍 Region Not Supported\nGemini API is currently restricted in your region. You may need to use a VPN or a proxy to access this service.';
    }

    if (responseStatus === 404 || msg.includes('not found')) {
        return '### 🔎 Model Not Found (404)\nThe selected Gemini model was not found for this key/project. I automatically try multiple flash models; if this still appears, your API key/project likely has model access limitations.';
    }

    return `### 🛑 Request Failed\n${apiMessage || err.message || 'Check your internet connection or API key and try again.'}`;
}

// IRCTC Knowledge Base (embedded for client-side use) — Comprehensive Edition
const IRCTC_KB = `
══════════════════════════════════════════════════════════════════
IRCTC (Indian Railway Catering and Tourism Corporation) — Comprehensive Knowledge Base
══════════════════════════════════════════════════════════════════

═══ 1. TICKET BOOKING — GENERAL ═══

ONLINE BOOKING:
- Tickets can be booked through the IRCTC website (www.irctc.co.in), IRCTC Rail Connect mobile app (Android & iOS), or IRCTC-authorized travel agents.
- Users must create an IRCTC account with a valid email ID, mobile number, and government-issued photo ID proof (Aadhaar, PAN, Passport, Voter ID, Driving License, etc.).
- Only one IRCTC account is allowed per person (linked to a unique email + mobile).
- Advance Reservation Period (ARP): Booking opens 120 days in advance at 8:00 AM for most trains.
- ARP for some special/holiday trains may be extended or restricted — check IRCTC for announcements.
- Maximum 6 passengers per PNR for general quota bookings.
- A single IRCTC user can book a maximum of 12 tickets per month (6 via e-tickets + 6 via i-tickets).
- Booking is available 24/7 online, except during brief maintenance windows (~11:30 PM to 12:05 AM).
- A user can link up to 12 master passengers to their profile for faster booking.

E-TICKET vs I-TICKET:
- E-Ticket: Electronic ticket, no physical printout required; show digital copy + valid ID during travel.
- I-Ticket: Physical ticket printed and sent by post; delivered 2-3 days before journey.
- E-Tickets can be cancelled online; I-Tickets must be cancelled at the reservation counter.
- E-Ticket passengers MUST carry an authorized government photo ID proof matching the name on the ticket.

COUNTER BOOKING:
- Counter tickets can be booked at railway reservation counters (PRS — Passenger Reservation System).
- Counter booking opens at 8:00 AM and closes at 10:00 PM at most stations.
- Counter Tatkal booking opens 30 minutes AFTER online Tatkal (10:30 AM for AC, 11:30 AM for non-AC).
- Counter tickets require a reservation form (filled manually) and valid ID.

═══ 2. TATKAL BOOKING ═══

TATKAL SCHEME:
- Tatkal booking opens 1 day before the journey date (excluding the journey date).
- AC classes (1A, 2A, 3A, CC, 3E): Opens at 10:00 AM sharp.
- Non-AC classes (SL, 2S): Opens at 11:00 AM sharp.
- Maximum 4 passengers per PNR in Tatkal.
- Tatkal tickets CANNOT be booked on the day of journey.
- No concessions are available for Tatkal tickets (except for Divyangjan/physically handicapped and select categories).

TATKAL CHARGES (in addition to normal fare):
- 2S (Second Sitting): Min Rs. 10 – Max Rs. 15
- SL (Sleeper): Min Rs. 100 – Max Rs. 200
- CC (Chair Car): Min Rs. 100 – Max Rs. 225
- 3E (Third AC Economy): Min Rs. 200 – Max Rs. 350
- 3A (Third AC): Min Rs. 300 – Max Rs. 400
- 2A (Second AC): Min Rs. 400 – Max Rs. 500
- 1A (First AC): Min Rs. 400 – Max Rs. 500

TATKAL REFUND RULES:
- NO REFUND is given on voluntary cancellation of Tatkal tickets.
- Full refund (minus clerkage) ONLY if:
  - The train is cancelled by Railways.
  - The train departs late by more than 3 hours from the boarding station.
  - The passenger is not provided accommodation despite having a confirmed ticket.
  - The AC has failed in the AC coach.
- For partially confirmed Tatkal tickets (some passengers WL), only waitlisted passengers get a refund.

PREMIUM TATKAL:
- Opens at 10:00 AM for AC and 11:00 AM for non-AC classes.
- Uses dynamic/variable pricing — fare increases as demand increases.
- No concessions allowed. No refund on cancellation under any circumstance.
- No agents/touts can book premium Tatkal (CAPTCHA-based verification enforced).

═══ 3. TICKET CLASSES — DETAILED ═══

1A (First AC — First Class Air-Conditioned):
- Most luxurious class. Private lockable cabins (2-berth or 4-berth coupes).
- Bedding (sheets, blanket, pillow) provided. Individual reading light.
- Fares are 4-5x Sleeper class. Available on premier trains (Rajdhani, Duronto, etc.).
- Attendant service, personal charging points, bio-toilets.

2A (Second AC — Two-Tier Air-Conditioned):
- Curtained berths for privacy. 2-tier layout (lower & upper berths).
- Bedding provided. Charging points at every berth.
- Popular for business and family travel.

3A (Third AC — Three-Tier Air-Conditioned):
- 3-tier berths per bay (lower, middle, upper) + side lower & side upper.
- Bedding provided. Most popular AC class due to affordability.
- Curtains on side berths. Charging points shared.

3E (Third AC Economy):
- Introduced in 2021. Same as 3A but with one extra berth per bay (8 berths per bay vs 6).
- Slightly cheaper than 3A. Bedding provided. Available on select trains.
- Commonly available on Vande Bharat-style upgraded trains.

CC (Chair Car — AC Chair Car):
- Reserved AC seating. Used for day-travel trains (Shatabdi, Vande Bharat, Jan Shatabdi).
- Rotating/reclining seats. Complimentary meals on Shatabdi/Vande Bharat trains.
- No berths — seats only.

EC (Executive Chair Car):
- Premium AC chair class. Wider, more comfortable reclining seats. More legroom.
- Available on Shatabdi and Vande Bharat trains.
- Complimentary snacks and meals included.

SL (Sleeper Class):
- Non-AC 3-tier berths. Most affordable overnight travel option.
- No bedding provided (carry your own). Ceiling fans only.
- Open windows with bars. Very popular for budget travel.

2S (Second Sitting — Unreserved Seating):
- Non-AC seating. Cheapest reserved class.
- For short-distance day travel. Hard bench-style seats.
- Available on passenger, MEMU, and DEMU trains.

GN (General / Unreserved):
- No reservation needed. Buy a general ticket at the counter.
- Unreserved coaches available on all trains.
- Extremely affordable but no guaranteed seat.

═══ 4. PNR STATUS — DETAILED ═══

PNR BASICS:
- PNR (Passenger Name Record) is a unique 10-digit number assigned to every booking.
- Located on the top-left corner of the ticket/e-ticket printout.
- Each PNR can have up to 6 passengers (4 for Tatkal).

HOW TO CHECK PNR STATUS:
- IRCTC website: www.irctc.co.in → "PNR Status" section.
- IRCTC Rail Connect App → PNR Enquiry.
- NTES App (National Train Enquiry System).
- Call 139 (IVRS system) → Select PNR option.
- SMS: Send "PNR <10-digit number>" to 139.
- Third-party apps: ixigo, ConfirmTkt, RailYatri (unofficial but popular).

PNR STATUS TYPES:
- CNF / Confirmed: Seat/berth is confirmed. You can travel.
- RAC (Reservation Against Cancellation):
  - You get a side-lower berth SHARED with another RAC passenger.
  - You CAN board the train and travel. You have legal right to travel.
  - RAC often gets upgraded to CNF if cancellations happen.
- WL (Waitlist):
  - You are on the waiting list. WL/1 is the first on the list.
  - Waitlisted passengers CANNOT board the train after chart preparation.
  - If WL ticket doesn't get confirmed by chart preparation, the ticket is auto-cancelled and refund is processed.
  - RLWL (Remote Location Waitlist): For intermediate stations.
  - GNWL (General Waitlist): For trains originating from that station.
  - PQWL (Pooled Quota Waitlist): For pooled/shared quota.
  - TQWL (Tatkal Quota Waitlist): For Tatkal quota.

CHART PREPARATION:
- First chart: Usually prepared 4 hours before departure (can vary).
- Second/final chart: 30 minutes to 1 hour before departure.
- After chart preparation, WL tickets that are still not confirmed get auto-cancelled.
- Post-chart passengers sometimes get confirmed during the second chart preparation.
- RAC passengers may get confirmed seats even after chart preparation as confirmed passengers don't board.

═══ 5. CANCELLATION & REFUND — COMPREHENSIVE ═══

CONFIRMED TICKET CANCELLATION:
- More than 48 hours before departure:
  - 1A / Executive Class: Rs. 240 flat cancellation charge
  - 2A / 3A / CC / 3E: Rs. 200 flat cancellation charge
  - SL: Rs. 120 flat cancellation charge
  - 2S: Rs. 60 flat cancellation charge
- Between 48 hours and 12 hours before departure:
  - 25% of the base fare is deducted as cancellation charge (minimum flat rate applies)
- Between 12 hours and 4 hours before departure:
  - 50% of the base fare is deducted as cancellation charge
- Less than 4 hours before departure:
  - E-Tickets: CANNOT be cancelled online. File a TDR instead.
  - Counter tickets: Can be cancelled up to 30 minutes AFTER scheduled departure with 50% charge + clerkage charge.

RAC TICKET CANCELLATION:
- Can be cancelled up to 30 minutes after the actual departure of the train.
- Same cancellation charges as confirmed tickets based on time bracket.

WAITLISTED TICKET:
- Can be cancelled anytime before chart preparation with nominal clerkage of Rs. 20-60.
- If WL is not confirmed by chart preparation → auto-cancelled, FULL refund minus clerkage.
- After chart preparation, if status is still WL, the ticket is automatically cancelled.

E-TICKET SPECIFIC RULES:
- E-tickets booked online can only be cancelled online (through IRCTC website/app).
- If a partly-confirmed e-ticket (e.g., 3 out of 5 passengers confirmed): 
  - Confirmed passengers' fare is subject to normal cancellation charges.
  - Waitlisted passengers get a full refund minus clerkage.
- If ALL passengers on an e-ticket are WL → auto-cancelled after chart, full refund.

TDR (Ticket Deposit Receipt):
- File a TDR when cancellation is not possible directly.
- TDR can be filed online through IRCTC within 72 hours of the scheduled departure.
- Scenarios where TDR applies:
  - Train cancelled by Railways.
  - Train delayed by more than 3 hours.
  - AC failure in the AC coach.
  - Downgrade (e.g., booked 2A but given 3A accommodation).
  - Passenger not allowed to board despite having a confirmed ticket.
- TDR refund is processed within 60-90 days after verification by Railways.

CLERKAGE CHARGES:
- Rs. 20 for 2S class.
- Rs. 30 for SL class.
- Rs. 60 for AC classes (CC, 3E, 3A, 2A, 1A, EC).

═══ 6. TRAIN TYPES ═══

RAJDHANI EXPRESS:
- Fully AC; connects major cities to New Delhi.
- Classes: 1A, 2A, 3A. Meals included in fare.
- One of the fastest conventional trains. Priority over other trains.

SHATABDI EXPRESS:
- Fully AC day-train; inter-city travel. No sleeper berths (chair car only).
- Classes: CC, EC. Complimentary meals and snacks included.
- Returns on the same day. Ideal for business travel.

DURONTO EXPRESS:
- Non-stop between origin and destination (no intermediate stops).
- Available in AC and non-AC classes. Meals included for AC classes.

VANDE BHARAT EXPRESS (Train 18):
- India's semi-high-speed train. Max speed 160 km/h.
- Fully AC with EC (Executive) and CC (Chair Car) classes.
- International-level amenities: GPS-based passenger info system, rotating chairs, bio-vacuum toilets, Wi-Fi (planned), automatic doors.
- Meals included in fare. Currently operates on ~50+ routes.
- Features: Onboard infotainment, modular pantry, fire detection systems.

GARIB RATH:
- Affordable AC train. Only 3A class (no 1A/2A). Subsidized fare.
- No complimentary meals. Budget-friendly option for AC travel.

HUMSAFAR EXPRESS:
- Fully 3A (Third AC). Modern amenities. GPS info display.
- LED lights, CCTV, fire suppression systems. No meals included.

TEJAS EXPRESS:
- Premium AC train with modern amenities. Classes: CC, EC.
- First train operated by IRCTC (not Indian Railways directly). Private-style operation.
- Includes: Entertainment screens, snack service, Wi-Fi (on select routes), clean restrooms.

ANTYODAYA EXPRESS:
- Fully unreserved superfast train. For general/unreserved passengers.
- Modern coaches, bio-toilets, charging points.

GATIMAAN EXPRESS:
- India's first semi-high-speed train (max 160 km/h).
- Delhi–Agra route. Fully AC (CC and EC). Meals included.

MEMU / DEMU / LOCAL TRAINS:
- MEMU (Mainline Electric Multiple Unit): Electric suburban trains.
- DEMU (Diesel Electric Multiple Unit): Diesel suburban trains.
- Used for short-distance daily commute. Unreserved travel.

PASSENGER / SLOW TRAINS:
- Stop at all intermediate stations. Cheapest fare. Unreserved.
- GN (General) class. Ideal for very short-distance travel.

═══ 7. QUOTAS ═══

GENERAL QUOTA (GN):
- Default booking quota. Open to all passengers. Largest allocation.

TATKAL QUOTA (TQ):
- Opens 1 day before journey. Higher fare. Limited seats.

LADIES QUOTA (LD):
- Reserved berths for solo female travelers or females traveling with children under 12.
- Available in specific coaches (usually lower berths). Limited quota.

SENIOR CITIZEN QUOTA:
- Specific lower berths reserved for passengers 60+ (male) and 58+ (female).

DEFENCE QUOTA (DF):
- Reserved for armed forces personnel and their families.
- Requires military ID or defence booking through authorized military counters.

FOREIGN TOURIST QUOTA (FT):
- For international travelers. Booking in USD/GBP. Available at major stations.
- Can be booked at international tourist reservation offices in Delhi, Mumbai, Kolkata, Chennai.

DUTY PASS QUOTA:
- Reserved for railway employees traveling on duty.

PARLIAMENT HOUSE QUOTA (PH):
- Reserved for Members of Parliament and their staff.

EMERGENCY QUOTA (EQ):
- Released by the Divisional Railway Manager for emergencies.

HO QUOTA (Headquarters Quota):
- Controlled by Railway Board for VIPs, dignitaries, and special requirements.

LOWER BERTH QUOTA:
- Reserved lower berths for senior citizens (60+/58+), pregnant women, and Divyangjan.
- Available in SL, 3A, 2A classes.

═══ 8. CONCESSIONS & DISCOUNTS ═══

SENIOR CITIZEN:
- Male (60 years and above): 40% concession on basic fare.
- Female (58 years and above): 50% concession on basic fare.
- Available in all classes except 1A and EC on Rajdhani/Shatabdi/Duronto.
- Note: As of recent policy, senior citizen concession has been SUSPENDED since March 2020 due to COVID and has NOT been restored yet (please check IRCTC for latest updates).

DIVYANGJAN (PERSON WITH DISABILITY):
- 50% to 75% discount depending on type and severity of disability.
- Blind/deaf/orthopedic/intellectual disability/mental illness — each has specific concession percentages.
- An escort can also get concession.
- Requires a valid disability certificate from a government hospital.

STUDENT CONCESSION:
- Available for students of recognized schools, colleges, and universities.
- Typically 25-50% concession on 2S and SL class.
- Requires a student concession certificate from the institution, countersigned by the station master.
- NOT available for online booking — only counter booking.

SPORTS QUOTA:
- For national/international athletes participating in events.
- Requires letter from Sports Authority of India (SAI) or recognized sports federation.
- 50-75% concession.

PATIENT CONCESSION:
- For patients traveling for treatment at specific government hospitals.
- Requires referral from government hospital.
- Available for heart patients, cancer patients, kidney patients, TB patients, etc.
- 50-100% concession depending on case. Escort also gets concession.

WAR WIDOW CONCESSION:
- 75% concession for war widows. Requires valid war widow identity card.

YOUTH CONCESSION:
- For youth aged 12-25 traveling for competitive exams.
- 50% concession on SL and 2S class (counter booking only).

PRESS CONCESSION:
- For accredited journalists. Requires valid press ID. 50% concession.

KISAN (FARMER) CONCESSION:
- Special concession for farmers visiting agricultural exhibitions.
- Requires certificate from District Magistrate/Block Development Officer.

═══ 9. LUGGAGE & CARRY-ON RULES ═══

FREE ALLOWANCE (per passenger):
- First AC (1A): 70 kg
- Second AC (2A): 50 kg
- Third AC (3A/3E): 40 kg
- Sleeper (SL): 40 kg
- Chair Car (CC/EC): 40 kg
- Second Sitting (2S): 35 kg
- General (GN): 15 kg (unreserved)

EXCESS LUGGAGE:
- Charged at approximately Rs. 30 per 10 kg (varies by class and distance).
- Must be declared at the luggage counter before departure.
- Undeclared excess luggage can result in a fine of 6x the normal luggage charge.

PROHIBITED ITEMS:
- Firearms, ammunition, explosives, inflammable substances.
- Acids, corrosive substances, radioactive materials.
- Foul-smelling or dangerous items.
- Live animals (except service dogs for Divyangjan with prior permission).
- Compressed gas cylinders.

BOOKING LUGGAGE IN ADVANCE:
- For heavy items (bicycles, large parcels), use the railway parcel service.
- Luggage can be booked at the parcel office at stations.
- Door-to-door luggage delivery available at select stations.

═══ 10. INSURANCE ═══

TRAVEL INSURANCE:
- Optional travel insurance available during booking for a nominal premium of Rs. 0.49 (for SL/2S) to Rs. 1.00 (for AC classes).
- Coverage up to Rs. 10 lakhs for death and permanent disability due to train accident.
- Coverage for partial disability: Rs. 7.5 lakhs.
- Coverage for hospitalization: Rs. 2 lakhs.
- Coverage for transportation of mortal remains: Rs. 10,000.
- Insurance is provided by IRCTC-approved insurance companies (currently Shriram General Insurance / IFCO Tokio).
- Must opt-in during ticket booking. Cannot be added after.

═══ 11. UPGRADATION ═══

AUTOMATIC UPGRADATION SCHEME:
- If your booked class is RAC/WL and a higher class has vacant berths, you MAY get upgraded.
- Upgradation is free — you pay only the original class fare.
- Example: Booked 3A (CNF), if 2A is vacant, you might get upgraded to 2A.
- Applicable only AFTER chart preparation.
- Can opt-out of upgradation at the time of booking by unchecking the option.
- Upgradation is subject to availability and is not guaranteed.

═══ 12. PLATFORM TICKET & STATION FACILITIES ═══

PLATFORM TICKET:
- Cost: Rs. 10-50 depending on the station.
- Allows entry to the platform to see off/receive passengers. NOT valid for travel.
- Available at the station counter or through UTS mobile app.

STATION AMENITIES:
- Retiring rooms: Available at major stations for short-stay rest. Book via IRCTC.
- Waiting rooms: Free for passengers with valid tickets.
- AC waiting lounges: Available at select stations for a small fee.
- Cloak rooms: Luggage storage at stations. Available at most junctions/major stations. Charges: Rs. 15-30 per item per day.
- Water and food stalls regulated by IRCTC at most stations.
- Wi-Fi: Free Wi-Fi available at 6000+ stations (by RailTel).
- ATMs, medical booths, and book stalls available at major stations.
- Wheelchair assistance: Available at major stations for Divyangjan and elderly passengers. Call 139 to request.
- Pay-per-use toilets at select stations (Rs. 2-5).
- Baby feeding rooms at stations like New Delhi, Mumbai CST, etc.

═══ 13. IRCTC TOURISM PACKAGES ═══

BHARAT GAURAV TRAINS:
- Theme-based circuit trains showcasing India's cultural heritage.
- All-inclusive packages: accommodation, meals, sightseeing.
- Routes cover Ramayana circuit, Buddhist circuit, Southern heritage, etc.

MAHARAJAS' EXPRESS:
- India's most luxurious train. World-class amenities.
- 7-day itineraries covering Royal India destinations.
- Fares start from $3,850 per person.

PALACE ON WHEELS:
- Rajasthan heritage train. One-week journey through Rajasthan.
- Luxury cabins with modern amenities. All meals and sightseeing included.

DECCAN ODYSSEY:
- Luxury train covering Maharashtra, Goa, and Karnataka.
- Spa, gym, conference car. International-standard luxury.

IRCTC AIR PACKAGES:
- Domestic and international tour packages combining flights + hotels.
- Available on irctctourism.com.

IRCTC BUS BOOKING:
- IRCTC partners with bus operators for inter-city bus tickets.
- Available on IRCTC website.

═══ 14. VANDE BHARAT DETAILS ═══

- India's indigenous semi-high-speed train designed by ICF Chennai.
- Max speed: 160 km/h (operational), 180 km/h (designed).
- Classes: Chair Car (CC) and Executive Chair Car (EC).
- Facilities: Bio-vacuum toilets, GPS-based info display, automatic doors, modular kitchen, comfortable rotating chairs, reading lights, mobile charging, CCTV.
- Meals included in fare: Breakfast/lunch/evening snacks depending on the route.
- Currently 50+ Vande Bharat pairs operational across India.
- Ticket prices vary by route: CC typically Rs. 1,200-2,200 and EC typically Rs. 2,200-3,800.
- Vande Bharat Sleeper (under development): Will have berths for overnight travel.

═══ 15. COMPLAINT & GRIEVANCE SYSTEM ═══

RAILMADAD (railmadad.indianrailways.gov.in):
- Centralized complaint portal for all railway-related grievances.
- Complaint categories: Cleanliness, staff behavior, catering, punctuality, security, refund, etc.
- Complaints can be filed via app, website, or SMS.
- Unique complaint number provided for tracking.
- Expected resolution time: 24-72 hours.

CALLING 139:
- Integrated Railway Helpline. Available 24/7 in 12 languages.
- Services: PNR status, train running status, fare enquiry, complaint registration, medical emergency, security (RPF), general enquiry.
- Press 1 for PNR, 2 for live status, 4 for complaint, 6 for medical emergency.

RPF (Railway Protection Force):
- Security-related complaints: theft, harassment, suspicious persons/items.
- Women helpline on trains: Call RPF helpline or 139 → Security.
- GRP (Government Railway Police) handles legal/criminal complaints.

IRCTC CUSTOMER CARE:
- Phone: 14646 or 011-23340000
- Email: care@irctc.co.in
- Timing: 24/7 for phone, email responses within 2-3 working days.
- Social media: @IRCTCofficial on Twitter/X — very responsive for urgent issues.
- For e-ticket refund grievances: eticket@irctc.co.in

═══ 16. IMPORTANT RULES & REGULATIONS ═══

BOARDING RULES:
- Arrive at least 15-20 minutes before departure.
- Carry valid photo ID proof matching the ticket (e-ticket: mandatory; counter ticket: mandatory if checked).
- Children below 5 years: Travel free, no ticket required, no separate berth.
- Children 5-11 years: Half fare + half reservation charge. Can be booked with berth or without berth.
- Children 12 years and above: Full adult fare required.

ID PROOFS ACCEPTED:
- Aadhaar Card, Passport, PAN Card, Voter ID, Driving License, Government-issued photo ID,
  Student ID from recognized institution (for students), Ration card with photo, 
  Credit/Debit card with photo, Senior citizen card from state government.
- For e-tickets, at least ONE passenger's ID must match.

NO-SHOW / NO-TRAVEL RULES:
- For confirmed e-ticket passengers who don't board: NO refund.
- For RAC passengers who don't board: NO refund after chart preparation.
- Partial cancellation is allowed (cancel some passengers, others travel).

BERTH ALLOCATION PREFERENCES:
- During booking, passengers can choose: Lower Berth (LB), Middle Berth (MB), Upper Berth (UB), Side Lower (SL), Side Upper (SU).
- Preference is NOT guaranteed — it is subject to availability.
- Senior citizens (60+/58+) and Divyangjan get priority for lower berths.
- Women traveling alone with children below 12 get priority for lower berths.

CHART PREPARATION & CURRENT BOOKING:
- After first chart preparation, "current" booking may be available at the counter.
- Current booking = last-minute booking from station counter after chart prep.
- Available only if vacant berths exist. Premium pricing may apply.

═══ 17. PAYMENT & REFUND PROCESSING ═══

PAYMENT METHODS:
- Credit Cards: Visa, MasterCard, RuPay, Amex.
- Debit Cards: All major bank debit cards with 3D-Secure.
- Net Banking: 40+ banks supported.
- UPI: Google Pay, PhonePe, Paytm, BHIM UPI, etc.
- IRCTC iMudra Wallet: Prepaid wallet for faster checkout.
- Cash on Delivery: Only for i-tickets at select locations.
- International cards: Accepted for Foreign Tourist Quota bookings.

REFUND PROCESSING TIME:
- E-ticket cancellation refund: 5-7 working days to the original payment method.
- Counter ticket cancellation: Immediate refund at the counter.
- TDR refund: 60-90 days after claim verification.
- WL auto-cancellation refund: Processed within 5-7 working days.
- Failed transaction refund: Auto-reversed within 3-5 working days. If not, file a complaint at IRCTC.

═══ 18. TATKAL TIPS & HACKS (LEGITIMATE) ═══

- Login to IRCTC 5-10 minutes before Tatkal opening.
- Pre-fill passenger details as "Master Passengers" in your profile.
- Use fast internet and a laptop/desktop (avoid mobile app during peak demand).
- Keep payment method ready (UPI or net banking tend to be fastest).
- Select "Book and Pay Later" option if available (gives 10-25 minutes to pay).
- Try from multiple devices if the website is slow.
- IRCTC Pay Later option: BNPL mode available with select banks.

═══ 19. ACCESSIBILITY & INCLUSIVE SERVICES ═══

- Wheelchair ramps available at major stations.
- Special coaches with wider doors for wheelchair access on select trains.
- Lower berth priority for Divyangjan with disability certificate.
- Battery-operated vehicles at major stations for Divyangjan/elderly.
- Braille signage at select stations.
- Assistance at stations: Call 139 → Divyangjan assistance option.
- Guide dog policy: Certified guide dogs allowed in all classes with prior permission.

═══ 20. FREQUENTLY ASKED QUESTIONS ═══

Q: Can someone else travel on my e-ticket?
A: No. Only the named passengers on the e-ticket can travel. At least one passenger with matching ID must be present.

Q: Can I change the date or train after booking?
A: No. Date change or train change is NOT allowed. You must cancel and rebook.

Q: Can I change the passenger name after booking?
A: No. Name changes are NOT allowed on e-tickets. For counter tickets, only minor corrections (spelling) are possible.

Q: What happens if I miss my train?
A: For e-tickets: No refund. For counter tickets: You can file a TDR within 72 hours, but refund is not guaranteed.

Q: Is Aadhaar mandatory for booking?
A: No. Aadhaar is one of many accepted IDs. Any government-issued photo ID works.

Q: Can I book a ticket for someone else?
A: Yes. You can book for anyone using your IRCTC account. Add their details as passengers.

Q: How many hours before departure can I book a ticket?
A: Online booking is available up to chart preparation (usually 4 hours before departure). After that, current booking at the counter is possible.

Q: What is IRCTC Food Plaza?
A: IRCTC Food Plazas are food courts at major stations run and managed by IRCTC. They serve hygienic meals at affordable prices.

Q: Can I carry pets on trains?
A: Dogs can be carried in First AC (1A) and Second AC (2A) only, with prior permission from the station master. A separate "dog ticket" must be purchased (approx fare of 1 passenger). Other pets are not allowed.

Q: What is an RAC berth like?
A: RAC passengers share a side-lower berth with one other RAC passenger. Both get a seat (not a full berth). It's a half-berth arrangement.

Q: Can I get a refund if I fall sick and cannot travel?
A: File a TDR with a medical certificate. Refund depends on Railways' verification and is not guaranteed.

Q: What should I do if I lose my e-ticket printout?
A: Show the ticket on your phone (IRCTC app or email) along with valid ID to the TTE. No printout needed for e-tickets.

Q: What happens during chain pulling?
A: Unauthorized chain pulling is a punishable offense under Indian Railways Act (fine up to Rs. 1,000 or imprisonment up to 1 year). Report genuine emergencies via SOS on the train or call 139.
`;

// Track selected language
let selectedLanguage = 'auto';

const LANGUAGE_NAMES = {
    'auto': 'Auto-Detect',
    'en': 'English',
    'hi': 'हिन्दी (Hindi)',
    'bn': 'বাংলা (Bengali)',
    'te': 'తెలుగు (Telugu)',
    'mr': 'मराठी (Marathi)',
    'ta': 'தமிழ் (Tamil)',
    'gu': 'ગુજરાતી (Gujarati)',
    'kn': 'ಕನ್ನಡ (Kannada)',
    'ml': 'മലയാളം (Malayalam)',
    'pa': 'ਪੰਜਾਬੀ (Punjabi)',
    'or': 'ଓଡ଼ିଆ (Odia)',
    'as': 'অসমীয়া (Assamese)',
    'ur': 'اردو (Urdu)',
    'sa': 'संस्कृतम् (Sanskrit)',
    'kok': 'कोंकणी (Konkani)',
    'mai': 'मैथिली (Maithili)',
    'sd': 'سنڌي (Sindhi)',
    'ne': 'नेपाली (Nepali)',
    'doi': 'डोगरी (Dogri)',
    'mni': 'মৈতৈলোন্ (Manipuri)',
    'sat': 'ᱥᱟᱱᱛᱟᱲᱤ (Santali)',
    'ks': 'كٲشُر (Kashmiri)',
    'bo': 'བོད་སྐད (Bodo)'
};

function getLanguageInstruction() {
    if (selectedLanguage === 'auto') {
        return `MULTILINGUAL SUPPORT (CRITICAL):
- You MUST auto-detect the language of the user's message.
- ALWAYS reply in the SAME language the user writes in.
- If the user writes in Hindi, reply entirely in Hindi (Devanagari script).
- If the user writes in Tamil, reply entirely in Tamil script.
- If the user writes in Telugu, reply entirely in Telugu script.
- If the user writes in Bengali, reply entirely in Bengali script.
- If the user writes in Marathi, reply entirely in Marathi (Devanagari script).
- If the user writes in Gujarati, reply entirely in Gujarati script.
- If the user writes in Kannada, reply entirely in Kannada script.
- If the user writes in Malayalam, reply entirely in Malayalam script.
- If the user writes in Punjabi, reply entirely in Gurmukhi script.
- If the user writes in Odia, reply entirely in Odia script.
- If the user writes in Urdu, reply entirely in Urdu (Nastaliq/Arabic script).
- If the user writes in Assamese, reply entirely in Assamese script.
- And so on for any other Indian language — always match the user's language and script.
- If the user writes in English, reply in English.
- If the user mixes languages (e.g., Hinglish — Hindi written in Roman script), reply in the same mixed style.
- NEVER switch to English unless the user writes in English. This is extremely important.
- Use culturally appropriate greetings for each language (e.g., "নমস্কার" for Bengali, "வணக்கம்" for Tamil, "నమస్కారం" for Telugu, etc.).`;
    } else {
        const langName = LANGUAGE_NAMES[selectedLanguage] || selectedLanguage;
        return `LANGUAGE INSTRUCTION (CRITICAL):
- The user has selected "${langName}" as their preferred language.
- You MUST respond ENTIRELY in ${langName} using the appropriate script.
- Do NOT respond in English unless the selected language is English.
- Use culturally appropriate greetings for this language.
- All technical terms (like PNR, IRCTC, etc.) can remain in English, but everything else must be in ${langName}.`;
    }
}

function buildSystemPrompt() {
    return `You are IRTC (Intelligent Response Training Chatbot), an expert IRCTC customer care executive and railway travel advisor. You provide friendly, accurate, and empathetic assistance to Indian Railway passengers in ALL Indian languages.

YOUR PERSONALITY:
- Always greet warmly and use polite, professional language.
- Show empathy when passengers describe problems or frustrations.
- Be patient and thorough — never rush the customer.

${getLanguageInstruction()}

YOUR CAPABILITIES:
- Answer questions about ticket booking, cancellation, refund policies, train schedules, PNR status, and all IRCTC services.
- Provide step-by-step guidance for complex procedures.
- Calculate approximate refund amounts when given ticket details.
- Recommend the best class, train type, or quota for the passenger's needs.
- Explain rules clearly with examples when helpful.
- Communicate fluently in ALL 22 scheduled Indian languages + English.

RESPONSE GUIDELINES:
- Format responses in a clean, readable way with bullet points, numbered steps, and bold text for key information.
- Include relevant refund amounts, timelines, and rules whenever discussing cancellation.
- When answering about fares, always mention that fares are approximate and can vary by route/season.
- If a question has multiple possible answers depending on the situation, list all scenarios.
- Always end with a helpful closing in the user's language (e.g., "और कुछ मदद चाहिए?" in Hindi, "வேறு ஏதாவது உதவி வேண்டுமா?" in Tamil, etc.)
- If you truly don't know something, honestly say so and direct the user to:
  - Customer care: 14646 or 011-23340000
  - Email: care@irctc.co.in
  - Grievance portal: railmadad.indianrailways.gov.in

IMPORTANT RULES:
- ONLY use the knowledge base below for factual answers. Do NOT make up information.
- If a question is completely outside railway/IRCTC domain, politely redirect.
- Never share personal opinions on government policies — only state facts.
- When discussing concessions, mention that senior citizen concessions are currently suspended (since COVID-2020) and suggest checking IRCTC for latest updates.

Knowledge Base:
${IRCTC_KB}`;
}

let conversationHistory = [];

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChat');
const quickActions = document.getElementById('quickActions');

const apiKeyInput = document.getElementById('apiKeyInput');
const apiKeySave = document.getElementById('apiKeySave');
if (apiKeySave && apiKeyInput) {
    apiKeySave.addEventListener('click', () => {
        const statusEl = document.getElementById('apiKeyStatus');
        const raw = apiKeyInput.value.trim();
        if (!raw) {
            setStoredGeminiKey('');
            if (statusEl) statusEl.textContent = 'Key cleared. Paste a new key to use the chat.';
            syncApiKeyBannerUi();
            return;
        }
        setStoredGeminiKey(raw);
        apiKeyInput.value = '';
        if (statusEl) statusEl.textContent = 'Saved. You can send a message now.';
        syncApiKeyBannerUi();
    });
}
syncApiKeyBannerUi();

// Send message
async function sendMessage(message) {
    if (!message.trim()) return;

    // Hide quick actions after first message
    quickActions.style.display = 'none';

    // Add user message
    appendMessage(message, 'user');
    chatInput.value = '';

    // Add to history
    conversationHistory.push({ role: 'user', parts: [{ text: message }] });

    // Show typing indicator
    const typingEl = showTypingIndicator();

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        typingEl.remove();
        conversationHistory.pop();
        appendMessage(
            'No Gemini API key yet. Paste your key in the box above this chat and click **Save key**, then try again.',
            'bot'
        );
        syncApiKeyBannerUi();
        document.getElementById('apiKeyInput')?.focus();
        return;
    }

    try {
        const response = await callGeminiAPI(message);
        typingEl.remove();
        appendMessage(response, 'bot');
        conversationHistory.push({ role: 'model', parts: [{ text: response }] });
    } catch (error) {
        typingEl.remove();
        conversationHistory.pop();
        console.error('API Error:', error);
        const detail = formatGeminiError(error, error.status, error.apiMessage);
        appendMessage(detail, 'bot');
    }
}

async function callGeminiAPI(message) {
    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [{ text: buildSystemPrompt() }]
            },
            {
                role: 'model',
                parts: [{ text: 'Understood. I am IRTC, your railway customer care assistant. I will use the provided knowledge base to answer questions politely and accurately. How can I help you today?' }]
            },
            ...conversationHistory
        ],
        generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024,
        },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
    };

    let lastError = null;

    const candidateModels = await resolveAvailableGeminiModels();

    // Try each endpoint version
    for (const version of GEMINI_ENDPOINTS) {
        // Try each model in the list
        for (const model of candidateModels) {
            try {
                const response = await fetch(geminiApiUrl(model, version), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                        return data.candidates[0].content.parts[0].text;
                    }
                } else if (response.status !== 404 && response.status !== 429) {
                    // If it's a 403 or other non-retryable error, stop trying and show the help
                    let apiMessage = '';
                    try {
                        const errJson = await response.json();
                        apiMessage = errJson.error?.message || '';
                    } catch { /* ignore */ }
                    const err = new Error(`API request failed: ${response.status}`);
                    err.status = response.status;
                    err.apiMessage = apiMessage;
                    throw err;
                } else {
                    // 404 or 429: silent fallback to next model/version
                    const errJson = await response.json().catch(() => ({}));
                    lastError = { status: response.status, apiMessage: errJson.error?.message || '' };
                    console.warn(`Model ${model} on ${version} failed with ${response.status}. Trying next...`);
                }
            } catch (e) {
                if (e.status === 403) throw e; // Don't retry on permissions
                lastError = e;
            }
        }
    }

    // If we're here, all fallbacks failed
    const finalErr = new Error(lastError?.apiMessage || 'All Gemini models and versions failed. This usually means the API key is restricted or the region is not supported.');
    finalErr.status = lastError?.status || 500;
    finalErr.apiMessage = lastError?.apiMessage || '';
    throw finalErr;
}


function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const avatar = sender === 'bot' ? '🚄' : '👤';

    // Format bot text with proper HTML
    let formattedText = text;
    if (sender === 'bot') {
        formattedText = formatBotResponse(text);
    }

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-bubble">
            ${sender === 'bot' ? formattedText : `<p>${escapeHtml(text)}</p>`}
            <span class="message-time">${timeStr}</span>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatBotResponse(text) {
    // Convert markdown-like formatting to HTML
    let html = text;

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Bullet points
    const lines = html.split('\n');
    let result = '';
    let inList = false;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
            if (!inList) {
                result += '<ul>';
                inList = true;
            }
            result += `<li>${trimmed.substring(2)}</li>`;
        } else {
            if (inList) {
                result += '</ul>';
                inList = false;
            }
            if (trimmed) {
                result += `<p>${trimmed}</p>`;
            }
        }
    });

    if (inList) result += '</ul>';
    return result;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-message';
    typingDiv.innerHTML = `
        <div class="message-avatar">🚄</div>
        <div class="message-bubble">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Event listeners
sendBtn.addEventListener('click', () => sendMessage(chatInput.value));

// Language Selector
const languageSelect = document.getElementById('languageSelect');
if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
        selectedLanguage = e.target.value;
    });
}

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(chatInput.value);
    }
});

// Quick action buttons
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        chatInput.value = query;
        sendMessage(query);
    });
});

// Clear chat
clearChatBtn.addEventListener('click', () => {
    conversationHistory = [];
    chatMessages.innerHTML = `
        <div class="message bot-message">
            <div class="message-avatar">🚄</div>
            <div class="message-bubble">
                <p>Namaste! 🙏 Chat has been cleared. How can I help you today?</p>
                <span class="message-time">Just now</span>
            </div>
        </div>
    `;
    quickActions.style.display = 'flex';
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // If the link is for the chatbot, auto-focus the input box
            if (targetId === '#chatbot') {
                setTimeout(() => {
                    document.getElementById('chatInput').focus();
                }, 800); // Wait for scroll to complete
            }
        }
    });
});
