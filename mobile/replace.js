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
    
    // Replace module folder paths in imports
    content = content.replace(/features\/module01/g, 'features/auth');
    content = content.replace(/features\/module02/g, 'features/settings');
    content = content.replace(/features\/module03/g, 'features/metrics');
    content = content.replace(/features\/module04/g, 'features/workouts');
    content = content.replace(/features\/module05/g, 'features/nutrition');
    content = content.replace(/features\/module06/g, 'features/home');

    // Replace module01-layout with onboarding-layout
    content = content.replace(/module01-layout/g, 'onboarding-layout');
    content = content.replace(/Module01Layout/g, 'OnboardingLayout');

    // Replace module01-store with onboarding-store
    content = content.replace(/module01-store/g, 'onboarding-store');
    content = content.replace(/useModule01Store/g, 'useOnboardingStore');
    content = content.replace(/Module01Store/g, 'OnboardingStore');

    // Rename Module01Navigator, etc
    content = content.replace(/module01-navigator/g, 'auth-navigator');
    content = content.replace(/Module01Navigator/g, 'AuthNavigator');
    content = content.replace(/module01-types/g, 'auth-types');
    content = content.replace(/Module01Stack/g, 'AuthStack');

    if (content !== orig) {
        fs.writeFileSync(f, content, 'utf8');
    }
});
console.log("Replacements complete.");
