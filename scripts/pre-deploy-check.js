#!/usr/bin/env node

/**
 * TradeTalk Community - Pre-Deployment Verification
 * Run this before deploying to Vercel to catch issues
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 TradeTalk Pre-Deployment Check\n');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// Check 1: Environment variables
console.log('1️⃣ Checking environment variables...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('VITE_SUPABASE_URL') && envContent.includes('VITE_SUPABASE_ANON_KEY')) {
    checks.passed.push('Environment variables found');
  } else {
    checks.failed.push('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  }
} else {
  checks.warnings.push('.env file not found - make sure Vercel env vars are set');
}

// Check 2: Critical files exist
console.log('2️⃣ Checking critical files...');
const criticalFiles = [
  'src/App.jsx',
  'src/main.jsx',
  'src/lib/supabase.js',
  'src/contexts/AuthContext.jsx',
  'src/pages/FeedPageIntegrated.jsx',
  'src/pages/CreatePostImproved.jsx',
  'src/pages/ExplorePage.jsx',
  'src/components/posts/PostCard.jsx',
  'src/components/posts/CommentCard.jsx',
  'index.html',
  'vite.config.js',
  'package.json'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    checks.passed.push(`${file} exists`);
  } else {
    checks.failed.push(`Missing critical file: ${file}`);
  }
});

// Check 3: Package.json scripts
console.log('3️⃣ Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
if (packageJson.scripts.build && packageJson.scripts.dev) {
  checks.passed.push('Build and dev scripts configured');
} else {
  checks.failed.push('Missing build or dev scripts in package.json');
}

// Check 4: Dependencies
console.log('4️⃣ Checking dependencies...');
const requiredDeps = ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'react-hot-toast'];
const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
if (missingDeps.length === 0) {
  checks.passed.push('All required dependencies installed');
} else {
  checks.failed.push(`Missing dependencies: ${missingDeps.join(', ')}`);
}

// Check 5: Vercel configuration
console.log('5️⃣ Checking Vercel config...');
const vercelPath = path.join(__dirname, 'vercel.json');
if (fs.existsSync(vercelPath)) {
  checks.passed.push('vercel.json exists');
} else {
  checks.warnings.push('No vercel.json - will use defaults');
}

// Check 6: Build output directory
console.log('6️⃣ Checking build config...');
const viteConfigPath = path.join(__dirname, 'vite.config.js');
if (fs.existsSync(viteConfigPath)) {
  checks.passed.push('vite.config.js exists');
} else {
  checks.failed.push('Missing vite.config.js');
}

// Print results
console.log('\n📊 RESULTS:\n');

if (checks.passed.length > 0) {
  console.log('✅ PASSED:');
  checks.passed.forEach(check => console.log(`  ✓ ${check}`));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  checks.warnings.forEach(check => console.log(`  ⚠ ${check}`));
  console.log('');
}

if (checks.failed.length > 0) {
  console.log('❌ FAILED:');
  checks.failed.forEach(check => console.log(`  ✗ ${check}`));
  console.log('');
}

// Final verdict
if (checks.failed.length === 0) {
  console.log('✨ Ready to deploy!\n');
  console.log('Next steps:');
  console.log('1. npm run build');
  console.log('2. Test the build: npm run preview');
  console.log('3. git add . && git commit -m "Ready for deployment"');
  console.log('4. git push');
  console.log('5. Deploy on Vercel\n');
  process.exit(0);
} else {
  console.log('⛔ NOT ready to deploy. Fix the issues above first.\n');
  process.exit(1);
}
