/* Type and topic chips on the Publications page. Sections with no matching papers are hidden. */
(function () {
    var bar = document.querySelector('.pub-filters');
    if (!bar) return;
    var status = bar.querySelector('.filter-status');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.pub[data-type]'));
    var state = { type: 'all', topic: 'all' };

    function apply() {
        var shown = 0;
        cards.forEach(function (card) {
            var ok = (state.type === 'all' || card.getAttribute('data-type') === state.type)
                && (state.topic === 'all' || (' ' + card.getAttribute('data-topics') + ' ').indexOf(' ' + state.topic + ' ') >= 0);
            card.classList.toggle('is-filtered-out', !ok);
            if (ok) shown++;
        });
        // hide a section heading (and its list) when none of its papers match
        document.querySelectorAll('.pub-list').forEach(function (list) {
            var any = list.querySelector('.pub:not(.is-filtered-out)');
            list.classList.toggle('is-filtered-out', !any);
            var heading = list.previousElementSibling;
            if (heading && heading.tagName === 'H2') heading.classList.toggle('is-filtered-out', !any);
        });
        // let the contents list re-check which section is current
        window.dispatchEvent(new Event('scroll'));
        var filtered = state.type !== 'all' || state.topic !== 'all';
        status.textContent = filtered
            ? (shown ? 'Showing ' + shown + ' of ' + cards.length + ' publications.' : 'No publications match these filters.')
            : '';
    }

    bar.querySelectorAll('.filter-group').forEach(function (group) {
        var key = group.getAttribute('data-filter');
        var chips = Array.prototype.slice.call(group.querySelectorAll('.filter-chip'));
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                state[key] = chip.getAttribute('data-value');
                chips.forEach(function (c) {
                    c.classList.toggle('is-active', c === chip);
                    c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
                });
                apply();
            });
        });
    });
})();
