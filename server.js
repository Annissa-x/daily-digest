const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const SUBSCRIBERS_FILE = './subscribers.json';

// Initialize subscribers file
if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    fs.writeFileSync(SUBSCRIBERS_FILE, '[]');
}

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.mp3': 'audio/mpeg',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Handle API routes
    if (req.url === '/api/subscribe' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf8'));
                
                subscribers.push({
                    email: data.email || null,
                    whatsapp: data.whatsapp || null,
                    subscribedAt: new Date().toISOString()
                });
                
                fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to subscribe' }));
            }
        });
        return;
    }
    
    if (req.url === '/api/subscribers' && req.method === 'GET') {
        try {
            const subscribers = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(subscribers);
        } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('[]');
        }
        return;
    }
    
    // Serve static files
    let filePath = '.' + (req.url === '/' ? '/index.html' : req.url);
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Daily Digest running at http://localhost:${PORT}`);
});
