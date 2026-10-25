(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');

    // mobile menu
    if (header && toggle) {
        toggle.addEventListener('click', function () {
            var open = header.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.addEventListener('click', function (e) {
            if (!header.contains(e.target)) {
                header.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // light/dark switch; the choice is remembered, otherwise the system setting is followed
    var root = document.documentElement;
    var themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var chosen = root.getAttribute('data-theme');
            var dark = chosen ? chosen === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
            var next = dark ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
        });
    }

    // article contents: highlight the section being read, keeping it in view inside the sidebar list
    var tocBox = document.querySelector('.profile-toc');
    var tocLinks = tocBox ? Array.prototype.slice.call(tocBox.querySelectorAll('.toc-link')) : [];
    if (tocLinks.length) {
        var tocTargets = tocLinks.map(function (a) {
            return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
        });
        var updateToc = function () {
            // sections hidden by a filter (offsetParent is null) are skipped
            var visible = [];
            tocTargets.forEach(function (h, i) { if (h && h.offsetParent !== null) visible.push(i); });
            if (!visible.length) return;
            var current = visible[0];
            visible.forEach(function (i) {
                if (tocTargets[i].getBoundingClientRect().top < 140) current = i;
            });
            // a short last section can never reach the top, so pick it once the page is scrolled to the end
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = visible[visible.length - 1];
            tocLinks.forEach(function (a, i) { a.classList.toggle('active', i === current); });
            var active = tocLinks[current];
            if (active.offsetTop < tocBox.scrollTop || active.offsetTop > tocBox.scrollTop + tocBox.clientHeight - 32) {
                tocBox.scrollTop = active.offsetTop - tocBox.clientHeight / 3;
            }
        };
        window.addEventListener('scroll', updateToc, { passive: true });
        updateToc();
    }

    // back to top
    var toTop = document.querySelector('.to-top');
    if (toTop) {
        var onScroll = function () {
            toTop.classList.toggle('show', window.scrollY > 600);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // "New" badge on news from this month and last month
    var now = new Date();
    document.querySelectorAll('.news-item time[datetime]').forEach(function (time) {
        var parts = time.getAttribute('datetime').split('-');
        var months = (now.getFullYear() - parseInt(parts[0], 10)) * 12 + (now.getMonth() + 1 - parseInt(parts[1], 10));
        if (months >= 0 && months < 2) {
            var badge = document.createElement('span');
            badge.className = 'news-new';
            badge.textContent = 'New';
            time.appendChild(badge);
        }
    });

    // Cite: copy the paper's BibTeX
    var toast = null;
    var toastTimer = null;
    function showToast(text) {
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
    }
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
        return new Promise(function (resolve, reject) {
            var area = document.createElement('textarea');
            area.value = text;
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            var ok = document.execCommand('copy');
            document.body.removeChild(area);
            ok ? resolve() : reject();
        });
    }
    document.addEventListener('click', function (e) {
        var button = e.target.closest('.pub-cite');
        if (!button) return;
        copyText(button.getAttribute('data-bibtex')).then(function () {
            showToast('BibTeX copied to clipboard');
        }, function () {
            showToast('Could not copy. Please try again.');
        });
    });

    // click a research figure to enlarge it
    var lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;
    var lightboxImg = lightbox.querySelector('img');
    var lightboxCaption = lightbox.querySelector('figcaption');

    function openLightbox(src, caption) {
        lightboxImg.src = src;
        lightboxImg.alt = caption || '';
        lightboxCaption.textContent = caption || '';
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lightboxImg.removeAttribute('src');
        document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
        var link = e.target.closest('a.zoom');
        if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        var img = link.querySelector('img');
        openLightbox(link.href, link.getAttribute('data-caption') || (img && img.alt));
    });
    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
})();
