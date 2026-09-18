/* =========================================================
   NAMA — ORBITAL CORE : main interactions
   ========================================================= */
(function () {
    'use strict';
    const $ = (s, c) => (c || document).querySelector(s);
    const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;

    /* ---------- PRELOADER : BOOT SEQUENCE ---------- */
    const pl = $('#preloader'), bar = $('#plBar'), pct = $('#plPct');
    let p = 0;
    const boot = setInterval(() => {
        p += Math.random() * 13 + 6;
        if (p >= 100) { p = 100; clearInterval(boot); finishBoot(); }
        if (bar) bar.style.width = p + '%';
        if (pct) pct.textContent = Math.floor(p) + '%';
    }, 120);

    function finishBoot() {
        setTimeout(() => {
            if (pl) pl.classList.add('done');
            document.body.classList.add('loaded');
            setTimeout(() => pl && pl.remove(), 1100);
        }, 380);
    }

    /* ---------- STARFIELD CANVAS ---------- */
    const cv = $('#stars');
    if (cv && !reduce) {
        const ctx = cv.getContext('2d');
        let W, H, stars = [], shots = [], mx = 0, my = 0;

        function resize() {
            W = cv.width = window.innerWidth;
            H = cv.height = window.innerHeight;
            const n = Math.min(230, Math.floor(W / 6));
            stars = Array.from({ length: n }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                z: Math.random() * .8 + .2,
                r: Math.random() * 1.4 + .3,
                tw: Math.random() * Math.PI * 2,
                ts: Math.random() * .03 + .008
            }));
        }
        window.addEventListener('resize', resize);
        resize();

        window.addEventListener('mousemove', e => {
            mx = e.clientX / W - .5;
            my = e.clientY / H - .5;
        }, { passive: true });

        function spawnShot() {
            shots.push({
                x: W * .15 + Math.random() * W * .7,
                y: Math.random() * H * .35,
                vx: -(6 + Math.random() * 5),
                vy: 3 + Math.random() * 3,
                life: 1
            });
        }
        setInterval(() => { if (!document.hidden && Math.random() < .75) spawnShot(); }, 3000);

        (function loop() {
            ctx.clearRect(0, 0, W, H);
            for (const s of stars) {
                s.tw += s.ts;
                const a = .22 + .78 * Math.abs(Math.sin(s.tw));
                ctx.globalAlpha = a * s.z;
                ctx.fillStyle = s.z > .7 ? '#9ff3ff' : '#e6f7ff';
                ctx.beginPath();
                ctx.arc(s.x - mx * 30 * s.z, s.y - my * 30 * s.z, s.r * s.z + (s.z > .75 ? .4 : 0), 0, 7);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            shots = shots.filter(s => s.life > 0);
            for (const s of shots) {
                s.x += s.vx; s.y += s.vy; s.life -= .016;
                const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 8, s.y - s.vy * 8);
                g.addColorStop(0, 'rgba(125,249,255,' + (.9 * s.life).toFixed(3) + ')');
                g.addColorStop(1, 'rgba(123,92,255,0)');
                ctx.strokeStyle = g;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
                ctx.stroke();
            }
            requestAnimationFrame(loop);
        })();
    }

    /* ---------- CUSTOM CURSOR ---------- */
    const dot = $('#cDot'), ring = $('#cRing');
    if (dot && ring && fine) {
        let x = 0, y = 0, rx = 0, ry = 0;
        window.addEventListener('mousemove', e => {
            x = e.clientX; y = e.clientY;
            dot.style.left = x + 'px'; dot.style.top = y + 'px';
        }, { passive: true });
        (function cl() {
            rx += (x - rx) * .14; ry += (y - ry) * .14;
            ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
            requestAnimationFrame(cl);
        })();
        $$('a, button, .svc-head, .chip, .sector').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
        });
    } else {
        if (dot) dot.style.display = 'none';
        if (ring) ring.style.display = 'none';
    }

    /* ---------- NAV / PROGRESS / SPOTLIGHT / METHOD LINE ---------- */
    const nav = $('#nav'), prog = $('#scrollProgress span'), methodSec = $('#method'), methodBar = $('#methodProgress');
    window.addEventListener('scroll', () => {
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
        if (prog) {
            const h = document.documentElement;
            const d = h.scrollHeight - h.clientHeight;
            prog.style.width = (d ? (window.scrollY / d) * 100 : 0) + '%';
        }
        if (methodBar && methodSec) {
            const r = methodSec.getBoundingClientRect();
            const t = Math.min(1, Math.max(0, (window.innerHeight * .72 - r.top) / r.height));
            methodBar.style.transform = 'scaleY(' + t + ')';
        }
    }, { passive: true });

    window.addEventListener('mousemove', e => {
        document.body.style.setProperty('--spot-x', e.clientX + 'px');
        document.body.style.setProperty('--spot-y', e.clientY + 'px');
    }, { passive: true });

    /* ---------- ACTIVE NAV LINK ---------- */
    const links = $$('.navlinks a');
    if (links.length) {
        const map = {};
        links.forEach(a => { map[a.getAttribute('href')] = a; });
        const navIO = new IntersectionObserver(es => {
            es.forEach(en => {
                if (en.isIntersecting) {
                    links.forEach(l => l.classList.remove('active'));
                    const a = map['#' + en.target.id];
                    if (a) a.classList.add('active');
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        Object.keys(map).forEach(h => { const s = $(h); if (s) navIO.observe(s); });
    }

    /* ---------- REVEAL ON SCROLL ---------- */
    const rIO = new IntersectionObserver(es => {
        es.forEach(en => {
            if (en.isIntersecting) { en.target.classList.add('in'); rIO.unobserve(en.target); }
        });
    }, { threshold: .15 });
    $$('[data-reveal]').forEach(el => rIO.observe(el));

    /* ---------- COUNTERS ---------- */
    const cIO = new IntersectionObserver(es => {
        es.forEach(en => {
            if (!en.isIntersecting) return;
            cIO.unobserve(en.target);
            const el = en.target, end = +el.dataset.count, dur = 1700, t0 = performance.now();
            (function tick(t) {
                const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
                el.textContent = Math.round(end * e);
                if (k < 1) requestAnimationFrame(tick);
            })(t0);
        });
    }, { threshold: .6 });
    $$('[data-count]').forEach(el => cIO.observe(el));

    /* ---------- SERVICES ACCORDION ---------- */
    $$('.svc-item').forEach(item => {
        const head = $('.svc-head', item), body = $('.svc-body', item);
        if (!head || !body) return;
        head.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            $$('.svc-item.open').forEach(o => {
                o.classList.remove('open');
                const b = $('.svc-body', o);
                if (b) b.style.maxHeight = null;
            });
            if (!isOpen) {
                item.classList.add('open');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    /* ---------- MARQUEE : seamless loop ---------- */
    const track = $('#mqTrack');
    if (track) track.innerHTML += track.innerHTML;

    /* ---------- MAGNETIC BUTTONS ---------- */
    if (fine && !reduce) {
        $$('[data-magnet]').forEach(el => {
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18) + 'px,' + ((e.clientY - r.top - r.height / 2) * .22) + 'px)';
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    /* ---------- 3D TILT + SPOTLIGHT CARDS ---------- */
    if (fine && !reduce) {
        $$('.why-card, .vm-card, .team-card, .contact-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
                card.style.setProperty('--mx', (px * 100) + '%');
                card.style.setProperty('--my', (py * 100) + '%');
                card.style.transform = 'perspective(900px) rotateX(' + ((py - .5) * -6).toFixed(2) + 'deg) rotateY(' + ((px - .5) * 8).toFixed(2) + 'deg) translateY(-4px)';
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
    }
})();
