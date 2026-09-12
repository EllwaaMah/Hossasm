/* =========================================================
   NAMA — main.js
   Handles: preloader, hero intro, custom cursor, scroll
   reveal, counters, marquee, services accordion, method
   progress line, scroll progress bar, magnetic buttons,
   3D tilt on cards and the ambient mouse spotlight.
   ========================================================= */
(function () {
    'use strict';

    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    /* ---------- Preloader ---------- */
    const pl = document.getElementById('preloader');
    const plBar = document.getElementById('plBar');
    const plPct = document.getElementById('plPct');
    let prog = 0;

    const tick = setInterval(() => {
        prog = Math.min(prog + Math.random() * 14, 92);
        if (plBar) plBar.style.width = prog + '%';
        if (plPct) plPct.textContent = Math.round(prog) + '%';
    }, 120);

    document.body.style.overflow = 'hidden';

    window.addEventListener('load', () => {
        clearInterval(tick);
        if (plBar) plBar.style.width = '100%';
        if (plPct) plPct.textContent = '100%';
        setTimeout(() => {
            if (pl) pl.classList.add('done');
            document.body.style.overflow = '';
            heroIntro();
        }, 650);
    });

    function heroIntro() {
        document.querySelectorAll('.hero h1 .line > span').forEach((s, i) => {
            s.style.transition = 'transform 1.1s cubic-bezier(.22,.9,.28,1) ' + (0.15 + i * 0.15) + 's';
            s.style.transform = 'translateY(0)';
        });
        document.querySelectorAll('[data-hero]').forEach((el, i) => {
            el.style.transition = 'opacity 1s ease ' + (0.5 + i * 0.12) + 's';
            el.style.opacity = '1';
        });
        setTimeout(startCounters, 900);
    }

    /* ---------- Stat counters ---------- */
    let countersDone = false;

    function startCounters() {
        if (countersDone) return;
        countersDone = true;
        document.querySelectorAll('[data-count]').forEach(el => {
            const target = +el.dataset.count, dur = 1600, t0 = performance.now();
            (function step(t) {
                const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * e);
                if (p < 1) requestAnimationFrame(step);
            })(t0);
        });
    }

    /* ---------- Custom cursor ---------- */
    if (!isCoarse) {
        const dot = document.getElementById('cDot');
        const ring = document.getElementById('cRing');
        if (dot && ring) {
            let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
            addEventListener('mousemove', e => {
                mx = e.clientX;
                my = e.clientY;
                dot.style.left = mx + 'px';
                dot.style.top = my + 'px';
            });
            (function loop() {
                rx += (mx - rx) * .16;
                ry += (my - ry) * .16;
                ring.style.left = rx + 'px';
                ring.style.top = ry + 'px';
                requestAnimationFrame(loop);
            })();
            document.querySelectorAll('a,button,[data-hover]').forEach(el => {
                el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
                el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
            });
        }
    }

    /* ---------- Scroll reveal ---------- */
    const rio = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                rio.unobserve(e.target);
            }
        });
    }, {threshold: .12});
    document.querySelectorAll('[data-reveal]').forEach(el => rio.observe(el));

    /* ---------- Marquee duplication ---------- */
    const mq = document.getElementById('mqTrack');
    if (mq) mq.innerHTML += mq.innerHTML;

    const marquee = document.querySelector('.marquee');
    if (marquee && !RM) {
        marquee.addEventListener('mouseenter', () => marquee.style.filter = 'brightness(1.08)');
        marquee.addEventListener('mouseleave', () => marquee.style.filter = '');
    }

    /* ---------- Services accordion ---------- */
    document.querySelectorAll('.svc-item').forEach(item => {
        const head = item.querySelector('.svc-head');
        const body = item.querySelector('.svc-body');
        head.addEventListener('click', () => {
            const open = item.classList.contains('open');
            document.querySelectorAll('.svc-item.open').forEach(o => {
                o.classList.remove('open');
                o.querySelector('.svc-body').style.maxHeight = '0';
            });
            if (!open) {
                item.classList.add('open');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    const firstSvc = document.querySelector('.svc-item');
    if (firstSvc) {
        firstSvc.classList.add('open');
        requestAnimationFrame(() => {
            const body = firstSvc.querySelector('.svc-body');
            body.style.maxHeight = body.scrollHeight + 'px';
        });
    }

    // keyboard support + recalc on resize
    document.querySelectorAll('.svc-head').forEach(head => {
        head.setAttribute('role', 'button');
        head.setAttribute('tabindex', '0');
        head.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                head.click();
            }
        });
    });

    addEventListener('resize', () => {
        const openItem = document.querySelector('.svc-item.open .svc-body');
        if (openItem) openItem.style.maxHeight = openItem.scrollHeight + 'px';
    }, {passive: true});

    /* ---------- Method timeline progress ---------- */
    const mp = document.getElementById('methodProgress');
    const msec = document.getElementById('method');
    if (mp && msec) {
        addEventListener('scroll', () => {
            const r = msec.getBoundingClientRect();
            const p = Math.min(Math.max((innerHeight * 0.75 - r.top) / r.height, 0), 1);
            mp.style.transform = 'scaleY(' + p + ')';
        }, {passive: true});
    }

    /* ---------- Top scroll-progress bar ---------- */
    const progressBar = document.querySelector('#scrollProgress span');

    function updateScrollProgress() {
        const max = document.documentElement.scrollHeight - innerHeight;
        const value = max > 0 ? scrollY / max : 0;
        if (progressBar) progressBar.style.width = (value * 100) + '%';
    }

    addEventListener('scroll', updateScrollProgress, {passive: true});
    addEventListener('resize', updateScrollProgress, {passive: true});
    updateScrollProgress();

    /* ---------- Ambient mouse spotlight ---------- */
    if (!isCoarse && !RM) {
        let spotX = innerWidth * .5, spotY = innerHeight * .25;
        addEventListener('mousemove', e => {
            spotX += (e.clientX - spotX) * .10;
            spotY += (e.clientY - spotY) * .10;
            document.documentElement.style.setProperty('--spot-x', spotX + 'px');
            document.documentElement.style.setProperty('--spot-y', spotY + 'px');
        }, {passive: true});
    }

    /* ---------- Magnetic buttons ---------- */
    if (!isCoarse && !RM) {
        document.querySelectorAll('[data-magnet]').forEach(el => {
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18) + 'px,' + ((e.clientY - r.top - r.height / 2) * .28) + 'px)';
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });

        /* Why-cards spotlight tilt */
        document.querySelectorAll('.why-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
                card.style.setProperty('--mx', x * 100 + '%');
                card.style.setProperty('--my', y * 100 + '%');
                card.style.transform = 'rotateY(' + ((x - .5) * -8) + 'deg) rotateX(' + ((y - .5) * 8) + 'deg) translateY(-4px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });

        /* Subtle 3D depth for premium cards */
        document.querySelectorAll('.vm-card,.team-card,.contact-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - .5;
                const y = (e.clientY - r.top) / r.height - .5;
                card.style.transform =
                    'perspective(1100px) rotateY(' + (x * -2.8) +
                    'deg) rotateX(' + (y * 2.8) + 'deg) translateY(-4px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

})();
