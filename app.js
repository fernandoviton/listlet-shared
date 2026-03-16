// Table viewer/editor - THE REPLACEABLE FILE
// New apps delete this and write their own App.init()

var App = (function() {
    var api = null;
    var container = null;
    var listName = null;
    var savingTimeout = null;

    function init(el, name) {
        container = el;
        listName = name;
        api = createApi(name);

        Sync.init(api, function(data) {
            renderTable(data);
        });

        loadAndRender();
    }

    async function loadAndRender() {
        container.innerHTML = '<div class="loading">Loading...</div>';
        try {
            var data = await api.fetchData({ rows: [] });
            renderTable(data);
        } catch (err) {
            container.innerHTML = '<div class="error">Failed to load: ' + escapeHtml(err.message) + '</div>';
        }
    }

    function renderTable(data) {
        if (!data.rows) data.rows = [];

        var html = '<div class="table-editor">' +
            '<div class="table-toolbar">' +
                '<button class="btn btn-primary" id="addRowBtn">Add Row</button>' +
                '<span id="syncStatus" title="Sync status"></span>' +
            '</div>' +
            '<table class="data-table">' +
                '<thead><tr>' +
                    '<th>Content</th>' +
                    '<th class="col-actions">Actions</th>' +
                '</tr></thead>' +
                '<tbody>';

        for (var i = 0; i < data.rows.length; i++) {
            var row = data.rows[i];
            html += '<tr data-id="' + escapeHtml(row.id) + '">' +
                '<td>' +
                    '<input type="text" class="table-input" value="' + escapeHtml(row.text || '') + '" data-index="' + i + '">' +
                '</td>' +
                '<td class="col-actions">' +
                    '<button class="btn-icon delete-btn" data-index="' + i + '" title="Delete">&#10005;</button>' +
                '</td>' +
            '</tr>';
        }

        html += '</tbody></table></div>';
        container.innerHTML = html;

        // Bind events
        document.getElementById('addRowBtn').addEventListener('click', addRow);

        var inputs = container.querySelectorAll('.table-input');
        for (var j = 0; j < inputs.length; j++) {
            inputs[j].addEventListener('input', handleEdit);
        }

        var deletes = container.querySelectorAll('.delete-btn');
        for (var k = 0; k < deletes.length; k++) {
            deletes[k].addEventListener('click', handleDelete);
        }

        // Re-init sync status click
        var syncEl = document.getElementById('syncStatus');
        if (syncEl) {
            syncEl.addEventListener('click', function() {
                Sync.manualRefresh();
            });
        }
    }

    async function addRow() {
        Sync.resetActivity();
        showSaving();
        try {
            var data = await api.saveData(function(d) {
                if (!d.rows) d.rows = [];
                d.rows.push({ id: generateListId(), text: '' });
            });
            renderTable(data);
            // Focus the new row's input
            var inputs = container.querySelectorAll('.table-input');
            if (inputs.length > 0) {
                inputs[inputs.length - 1].focus();
            }
        } catch (err) {
            console.error('Failed to add row:', err);
        }
        hideSaving();
    }

    function handleEdit(e) {
        Sync.resetActivity();
        var index = parseInt(e.target.dataset.index);
        var value = e.target.value;

        // Debounce save
        clearTimeout(savingTimeout);
        savingTimeout = setTimeout(async function() {
            showSaving();
            try {
                await api.saveData(function(d) {
                    if (d.rows && d.rows[index]) {
                        d.rows[index].text = value;
                    }
                });
            } catch (err) {
                console.error('Failed to save:', err);
            }
            hideSaving();
        }, 500);
    }

    async function handleDelete(e) {
        Sync.resetActivity();
        var index = parseInt(e.target.dataset.index);
        showSaving();
        try {
            var data = await api.saveData(function(d) {
                if (d.rows) d.rows.splice(index, 1);
            });
            renderTable(data);
        } catch (err) {
            console.error('Failed to delete:', err);
        }
        hideSaving();
    }

    function showSaving() {
        var el = document.getElementById('savingIndicator');
        if (el) el.classList.add('visible');
    }

    function hideSaving() {
        var el = document.getElementById('savingIndicator');
        if (el) {
            setTimeout(function() { el.classList.remove('visible'); }, 300);
        }
    }

    return {
        init: init
    };
})();
