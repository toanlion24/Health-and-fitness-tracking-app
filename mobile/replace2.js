const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walk(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

const dir = path.join(__dirname, 'src');
const appTsx = path.join(__dirname, 'App.tsx');
const files = [appTsx];
walk(dir, f => {
    if (f.endsWith('.ts') || f.endsWith('.tsx')) files.push(f);
});

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let orig = content;
    
    content = content.replace(/module01/g, 'auth');
    content = content.replace(/module02/g, 'settings');
    content = content.replace(/module03/g, 'metrics');
    content = content.replace(/module04/g, 'workouts');
    content = content.replace(/module05/g, 'nutrition');
    content = content.replace(/module06/g, 'home');
    
    content = content.replace(/Module01/g, 'Auth');
    content = content.replace(/Module02/g, 'Settings');
    content = content.replace(/Module03/g, 'Metrics');
    content = content.replace(/Module04/g, 'Workouts');
    content = content.replace(/Module05/g, 'Nutrition');
    content = content.replace(/Module06/g, 'Home');

    if (content !== orig) {
        fs.writeFileSync(f, content, 'utf8');
    }
});
