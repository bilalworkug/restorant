const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Setup Multer for Image Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'assets', 'images', 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Setup Express
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'bilal-secret-key-2026',
    resave: false,
    saveUninitialized: true
}));

// Load Database
const dataPath = path.join(__dirname, 'data.json');
function loadData() {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}
function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Routes
app.get('/', (req, res) => {
    const data = loadData();
    res.render('index', { data });
});

// Admin Authentication Middleware
function checkAuth(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        req.session.loggedIn = true;
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Invalid credentials' });
    }
});

app.get('/logout', (req, res) => {
    req.session.loggedIn = false;
    res.redirect('/login');
});

// Admin Dashboard
app.get('/admin', checkAuth, (req, res) => {
    const data = loadData();
    res.render('admin', { data });
});

// API for Image Upload via Drag & Drop
app.post('/admin/upload', checkAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the URL relative to the project root
    res.json({ url: './assets/images/uploads/' + req.file.filename });
});

// Save Admin Updates
app.post('/admin/update', checkAuth, (req, res) => {
    const data = loadData();
    
    // Update Special Dish
    data.special.title = req.body.specialTitle;
    data.special.description = req.body.specialDescription;
    data.special.oldPrice = req.body.specialOldPrice;
    data.special.newPrice = req.body.specialNewPrice;

    // Update Menu Items
    for (let i = 0; i < data.menu.length; i++) {
        data.menu[i].name = req.body[`menu[${i}][name]`];
        data.menu[i].price = req.body[`menu[${i}][price]`];
        data.menu[i].desc = req.body[`menu[${i}][desc]`];
        data.menu[i].badge = req.body[`menu[${i}][badge]`];
        data.menu[i].image = req.body[`menu[${i}][image]`];
    }

    // Update Events
    // Note: since events are arrays, we loop based on incoming arrays
    // If only one event exists, body parser sends strings instead of arrays, so we normalize.
    const eTitles = [].concat(req.body['event[title]'] || []);
    const eSubtitles = [].concat(req.body['event[subtitle]'] || []);
    const eDates = [].concat(req.body['event[date]'] || []);
    const eImages = [].concat(req.body['event[image]'] || []);
    
    data.events = [];
    for (let i = 0; i < eTitles.length; i++) {
        data.events.push({
            title: eTitles[i],
            subtitle: eSubtitles[i],
            date: eDates[i],
            image: eImages[i]
        });
    }

    saveData(data);
    res.redirect('/admin?success=1');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
