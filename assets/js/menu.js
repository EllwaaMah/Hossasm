/* =========================================================
   NAMA — menu.js
   Handles: sticky nav background, burger / mobile menu,
   and highlighting the active section link.
   ========================================================= */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        const nav = document.getElementById('nav');
        if (nav) {
            addEventListener('scroll', () => {
                nav.classList.toggle('scrolled', scrollY > 40);
            }, {passive: true});
        }

        const burger = document.getElementById('burger');
        const mMenu = document.getElementById('mobileMenu');

        if (burger && mMenu) {
            burger.addEventListener('click', () => {
                burger.classList.toggle('open');
                mMenu.classList.toggle('open');
                document.body.style.overflow = mMenu.classList.contains('open') ? 'hidden' : '';
            });

            mMenu.querySelectorAll('a').forEach((a, i) => {
                a.style.transitionDelay = (0.08 + i * 0.06) + 's';
                a.addEventListener('click', () => {
                    burger.classList.remove('open');
                    mMenu.classList.remove('open');
                    document.body.style.overflow = '';
                });
            });
        }

        // Active link highlighting for both the desktop nav and the
        // general section list (kept as a single source of truth).
        const links = [...document.querySelectorAll('.navlinks a')];
        const allNavSections = ['home', 'about', 'services', 'why', 'method', 'sectors', 'team', 'contact'];

        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                links.forEach(link => {
                    link.classList.toggle(
                        'active',
                        link.getAttribute('href') === '#' + entry.target.id
                    );
                });
            });
        }, {rootMargin: '-42% 0px -48% 0px', threshold: 0});

        allNavSections.forEach(id => {
            const section = document.getElementById(id);
            if (section) sectionObserver.observe(section);
        });

    });
})();
