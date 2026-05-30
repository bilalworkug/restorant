const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));

ejs.renderFile(path.join(__dirname, 'views', 'index.ejs'), { data }, (err, str) => {
    if (err) {
        console.error(err);
    } else {
        fs.writeFileSync(path.join(__dirname, 'index.html'), str);
        console.log('index.html generated successfully.');
    }
});
