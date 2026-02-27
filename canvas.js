/**
 * canvas.js
 * Faithful recreation of the 2021.david-hckh.com Three.js scroll experience.
 *
 * Architecture:
 *  - One fixed full-screen WebGL canvas behind all HTML
 *  - 4 scene Groups stacked vertically in world space (one per section)
 *  - Camera lerps between groups as the user scrolls
 *  - Mouse moves add a subtle parallax offset
 *  - Baked textures on room/lab/contact, matcaps on character
 *  - Floating sprites + star particles
 */

(function () {
    'use strict';

    // ─── Bootstrap: wait for THREE + GLTFLoader ───────────────────────────────
    function waitForDeps(cb) {
        if (typeof THREE !== 'undefined' && THREE.GLTFLoader) { cb(); return; }
        let tries = 0;
        const id = setInterval(() => {
            tries++;
            if (typeof THREE !== 'undefined' && THREE.GLTFLoader) { clearInterval(id); cb(); }
            else if (tries > 100) { clearInterval(id); console.error('THREE / GLTFLoader never loaded'); }
        }, 50);
    }

    waitForDeps(init);

    // ─────────────────────────────────────────────────────────────────────────
    function init() {

        // ── Canvas / Renderer ──────────────────────────────────────────────────
        const canvas = document.getElementById('webgl');
        if (!canvas) { console.error('No #webgl canvas found'); return; }

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;

        // ── Scene ──────────────────────────────────────────────────────────────
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0a0a12');

        // ── Camera ─────────────────────────────────────────────────────────────
        const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 6);
        scene.add(camera);

        // ── Lights ─────────────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0xffffff, 1));
        const sun = new THREE.DirectionalLight(0xffffff, 3);
        sun.position.set(1, 2, 3);
        scene.add(sun);

        // ── Loaders ────────────────────────────────────────────────────────────
        const texLoader = new THREE.TextureLoader();
        const gltfLoader = new THREE.GLTFLoader();

        function tex(path) {
            const t = texLoader.load(path);
            t.flipY = false;
            t.encoding = THREE.sRGBEncoding;
            return t;
        }

        // ── Section layout ─────────────────────────────────────────────────────
        // Each section group sits at a fixed Y offset so the camera just moves down.
        const SECTIONS = 4;
        const GAP = 4;   // world-units between section centres

        // Camera positions & look-at for each section
        // (x offset alternates left/right like the reference site)
        const CAM = [
            { px: 0, py: 0, pz: 6, lx: 0, ly: 0, lz: 0 }, // Hero  – room on right
            { px: -2, py: -GAP, pz: 5.5, lx: -2, ly: -GAP, lz: 0 }, // About – character on left
            { px: 2, py: -GAP * 2, pz: 6, lx: 2, ly: -GAP * 2, lz: 0 }, // Work  – lab on right
            { px: -2, py: -GAP * 3, pz: 5.5, lx: -2, ly: -GAP * 3, lz: 0 }, // Contact
        ];

        // Groups (one per section)
        const groups = CAM.map((c, i) => {
            const g = new THREE.Group();
            g.position.set(0, -GAP * i, 0);
            scene.add(g);
            return g;
        });

        // ── Particles ──────────────────────────────────────────────────────────
        (function () {
            const N = 1200;
            const pos = new Float32Array(N * 3);
            for (let i = 0; i < N; i++) {
                pos[i * 3] = (Math.random() - 0.5) * 30;
                pos[i * 3 + 1] = (Math.random() - 0.5) * (GAP * SECTIONS + 10);
                pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
                color: 0xffffff, size: 0.02, sizeAttenuation: true,
                transparent: true, opacity: 0.7,
            })));
        }());

        // ── Sprite helper ──────────────────────────────────────────────────────
        const sprites = [];
        function addSprite(group, path, x, y, z, s = 0.4) {
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({
                map: texLoader.load(path), transparent: true, depthWrite: false,
            }));
            sp.position.set(x, y, z);
            sp.scale.setScalar(s);
            sp.userData.base = y;
            sp.userData.phase = Math.random() * Math.PI * 2;
            group.add(sp);
            sprites.push(sp);
        }

        // ── Model helper ───────────────────────────────────────────────────────
        const mixers = [];

        function loadBaked(glbPath, texPath, group, scale, ox, oy, oz) {
            const bakedTex = tex(texPath);
            gltfLoader.load(glbPath, gltf => {
                const root = gltf.scene;
                root.scale.setScalar(scale);
                root.position.set(ox, oy, oz);
                root.traverse(c => {
                    if (c.isMesh) c.material = new THREE.MeshBasicMaterial({ map: bakedTex });
                });
                group.add(root);
                if (gltf.animations.length) {
                    const mx = new THREE.AnimationMixer(root);
                    gltf.animations.forEach(cl => mx.clipAction(cl).play());
                    mixers.push(mx);
                }
            }, undefined, e => console.warn(glbPath, e));
        }

        // ── Section 0 – ROOM (hero) ────────────────────────────────────────────
        loadBaked('models/room/model.glb', 'models/room/baked.jpg', groups[0], 1.5, 0.8, -1.2, 0);
        loadBaked('models/room/shadow-model.glb', 'models/room/shadow-baked.jpg', groups[0], 1.5, 0.8, -1.2, 0);

        // ── Section 1 – CHARACTER (about) ──────────────────────────────────────
        const mcSkin = tex('textures/matcaps/skin.jpg');
        const mcShirt = tex('textures/matcaps/shirt.jpg');
        const mcPants = tex('textures/matcaps/pants.jpg');
        const mcWhite = tex('textures/matcaps/white.jpg');

        gltfLoader.load('models/character/model.glb', gltf => {
            const root = gltf.scene;
            root.scale.setScalar(1.8);
            root.position.set(-1, -1.6, 0);
            root.traverse(c => {
                if (!c.isMesh) return;
                const n = c.name.toLowerCase();
                let mc = mcSkin;
                if (/shirt|top|torso|body/.test(n)) mc = mcShirt;
                if (/pant|leg|lower|bottom/.test(n)) mc = mcPants;
                if (/eye|tooth|white|teeth/.test(n)) mc = mcWhite;
                c.material = new THREE.MeshMatcapMaterial({ matcap: mc });
            });
            groups[1].add(root);
            if (gltf.animations.length) {
                const mx = new THREE.AnimationMixer(root);
                gltf.animations.forEach(cl => mx.clipAction(cl).play());
                mixers.push(mx);
            }
        }, undefined, e => console.warn('character', e));

        // Floating sprites around character
        addSprite(groups[1], 'textures/sprites/bubble.png', 1.6, 0.5, 1.2, 0.38);
        addSprite(groups[1], 'textures/sprites/heart.png', -1.6, 0.9, 0.8, 0.32);
        addSprite(groups[1], 'textures/sprites/tone-0.png', 1.3, -0.1, 1.0, 0.28);
        addSprite(groups[1], 'textures/sprites/tone-1.png', -1.2, 0.3, 1.1, 0.28);
        addSprite(groups[1], 'textures/sprites/tone-2.png', 0.4, 1.1, 0.9, 0.24);

        // ── Section 2 – LAB (work) ─────────────────────────────────────────────
        loadBaked('models/lab/model.glb', 'models/lab/baked.jpg', groups[2], 1.4, 0.8, -1.2, 0);
        loadBaked('models/lab/shadow-model.glb', 'models/lab/shadow-baked.jpg', groups[2], 1.4, 0.8, -1.2, 0);

        // ── Section 3 – CONTACT ────────────────────────────────────────────────
        loadBaked('models/contact/model.glb', 'models/contact/baked.jpg', groups[3], 1.6, 0, -1.0, 0);
        loadBaked('models/contact/shadow-model.glb', 'models/contact/shadow-baked.jpg', groups[3], 1.6, 0, -1.0, 0);

        addSprite(groups[3], 'textures/sprites/new-message.png', 1.5, 0.7, 1.2, 0.42);
        addSprite(groups[3], 'textures/sprites/bubble-pop.png', -1.4, 0.4, 0.9, 0.36);
        addSprite(groups[3], 'textures/sprites/bubble.png', 0.6, 1.0, 0.8, 0.30);

        // ── Scroll tracking ────────────────────────────────────────────────────
        let scrollY = window.scrollY;
        window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

        // ── Mouse parallax ─────────────────────────────────────────────────────
        const cursor = { x: 0, y: 0 };
        window.addEventListener('mousemove', e => {
            cursor.x = (e.clientX / window.innerWidth - 0.5);
            cursor.y = (e.clientY / window.innerHeight - 0.5);
        });

        // ── Resize ─────────────────────────────────────────────────────────────
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });

        // ── Loading screen ─────────────────────────────────────────────────────
        const loadEl = document.getElementById('loading-screen');
        let hidden = false;
        function hideLoader() {
            if (hidden) return; hidden = true;
            if (!loadEl) return;
            loadEl.style.transition = 'opacity 1s ease';
            loadEl.style.opacity = '0';
            setTimeout(() => loadEl.style.display = 'none', 1100);
        }
        setTimeout(hideLoader, 2800);

        // ── Smooth camera state ────────────────────────────────────────────────
        const camCurrent = {
            px: CAM[0].px, py: CAM[0].py, pz: CAM[0].pz,
            lx: CAM[0].lx, ly: CAM[0].ly, lz: CAM[0].lz,
        };

        // ── Clock ──────────────────────────────────────────────────────────────
        const clock = new THREE.Clock();

        // ── Animate ────────────────────────────────────────────────────────────
        function tick() {
            requestAnimationFrame(tick);
            const delta = clock.getDelta();
            const elapsed = clock.elapsedTime;

            // ── Scroll → section fraction ──
            const totalH = document.documentElement.scrollHeight - window.innerHeight;
            const frac = totalH > 0 ? scrollY / totalH : 0;          // 0 → 1
            const rawSec = frac * (SECTIONS - 1);                       // 0 → 3
            const secIdx = Math.min(Math.floor(rawSec), SECTIONS - 2);  // 0,1,2
            const secFrac = rawSec - secIdx;                             // 0 → 1

            // ── Interpolate camera targets ──
            const a = CAM[secIdx];
            const b = CAM[secIdx + 1];
            const t = secFrac;

            const tpx = a.px + (b.px - a.px) * t;
            const tpy = a.py + (b.py - a.py) * t;
            const tpz = a.pz + (b.pz - a.pz) * t;
            const tlx = a.lx + (b.lx - a.lx) * t;
            const tly = a.ly + (b.ly - a.ly) * t;
            const tlz = a.lz + (b.lz - a.lz) * t;

            // ── Smooth lerp (easing factor 0.08) ──
            const ease = 0.08;
            camCurrent.px += (tpx - camCurrent.px) * ease;
            camCurrent.py += (tpy - camCurrent.py) * ease;
            camCurrent.pz += (tpz - camCurrent.pz) * ease;
            camCurrent.lx += (tlx - camCurrent.lx) * ease;
            camCurrent.ly += (tly - camCurrent.ly) * ease;
            camCurrent.lz += (tlz - camCurrent.lz) * ease;

            // ── Apply mouse parallax on top ──
            camera.position.set(
                camCurrent.px + cursor.x * 0.5,
                camCurrent.py - cursor.y * 0.3,
                camCurrent.pz,
            );
            camera.lookAt(
                camCurrent.lx + cursor.x * 0.5,
                camCurrent.ly - cursor.y * 0.3,
                camCurrent.lz,
            );

            // ── Idle group rotation (very subtle) ──
            groups.forEach((g, i) => {
                g.rotation.y = Math.sin(elapsed * 0.25 + i * 1.2) * 0.05;
            });

            // ── Float sprites ──
            sprites.forEach(sp => {
                sp.position.y = sp.userData.base + Math.sin(elapsed * 1.8 + sp.userData.phase) * 0.12;
                sp.rotation.z = Math.sin(elapsed * 0.9 + sp.userData.phase) * 0.08;
            });

            // ── Animation mixers ──
            mixers.forEach(mx => mx.update(delta));

            renderer.render(scene, camera);
        }

        tick();
    }

}());
