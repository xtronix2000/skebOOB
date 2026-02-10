let count = 0;
let selectedId = null;
let requests = [];

function loadRequests() {
    fetch('/api/requests')
        .then(res => res.json())
        .then(data => {
            requests = data;
            count = data.length;
            document.getElementById('count').textContent = count;

            renderSidebar();
        });
}

function renderSidebar() {
    const sidebar = document.getElementById('sidebar');

    if (requests.length === 0) {
        sidebar.innerHTML = '<div class="empty">Нет запросов</div>';
        return;
    }

    sidebar.innerHTML = '';

    // Отображаем в обратном порядке (новые сверху)
    requests.slice().reverse().forEach(req => {
        const item = document.createElement('div');
        item.className = 'request-list-item';

        if (req.id === selectedId) {
            item.classList.add('active');
        }

        item.innerHTML = `
            <div>
                <span class="method-badge ${req.method}">${req.method}</span>
                <span class="id">#${req.id}</span>
            </div>
            <div class="url">${req.url}</div>
            <div class="time">${req.date}</div>
        `;

        item.onclick = function() {
            showDetails(req.id);
        };

        sidebar.appendChild(item);
    });
}

function showDetails(id) {
    selectedId = id;
    const req = requests.find(r => r.id === id);
    if (!req) return;

    renderSidebar();

    const details = document.getElementById('details');

    details.innerHTML = `
        <div class="detail-header">
            <div>
                <span class="method-badge ${req.method}">${req.method}</span>
                <span class="id">Request #${req.id}</span>
            </div>
            <div class="time">${req.date}</div>
        </div>

        <div class="detail-section">
            <h3>URL</h3>
            <div class="detail-value">${req.url}</div>
        </div>

        <div class="detail-section">
            <h3>Remote IP</h3>
            <div class="detail-value">${req.host}</div>
        </div>

        <div class="detail-section">
            <h3>Size</h3>
            <div class="detail-value">${req.size} bytes</div>
        </div>

        ${Object.keys(req.query).length > 0 ? `
        <div class="detail-section">
            <h3>Query Parameters</h3>
            <pre>${JSON.stringify(req.query, null, 2)}</pre>
        </div>` : ''}

        <div class="detail-section">
            <h3>Headers</h3>
            <pre>${JSON.stringify(req.headers, null, 2)}</pre>
        </div>

        ${req.body ? `
        <div class="detail-section">
            <h3>Body</h3>
            <pre>${req.body}</pre>
        </div>` : ''}
    `;
}

function clearAll() {
    if (confirm('Очистить все запросы?')) {
        fetch('/clear', {method: 'POST'})
            .then(() => {
                selectedId = null;
                document.getElementById('details').innerHTML = '<div class="empty">Выберите запрос из списка</div>';
                loadRequests();
            });
    }
}

// Загрузка запросов и автообновление
loadRequests();
setInterval(loadRequests, 5000);
