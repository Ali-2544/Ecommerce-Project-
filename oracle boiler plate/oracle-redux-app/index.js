#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const program = new Command();

program
  .version('1.0.0')
  .argument('<appname>', 'name of the application')
  .action((appname) => {
    const appPath = path.join(process.cwd(), appname);
    
    if (fs.existsSync(appPath)) {
      console.error(`Directory ${appPath} already exists.`);
      process.exit(1);
    }

    fs.mkdirSync(appPath);

    const packageJson = {
      name: appname,
      version: '1.0.0',
      main: 'index.js',
      dependencies: {
        "@reduxjs/toolkit": "^1.6.1",
        "react-redux": "^7.2.5",
        "next": "latest",
        "react": "latest",
        "react-dom": "latest",
      },
      scripts: {
        "dev": "next dev",
        "build": "next build",
        "start": "next start"
      },
    };

    fs.writeFileSync(path.join(appPath, 'package.json'), JSON.stringify(packageJson, null, 2));

    const copyTemplate = (src, dest) => {
      fs.copySync(path.join(__dirname, 'templates', src), path.join(appPath, dest));
    };

    copyTemplate('store', 'store');
    copyTemplate('features', 'features');
    copyTemplate('pages', 'pages');

    console.log(`Installing dependencies for ${appname}...`);
    execSync('npm install', { cwd: appPath, stdio: 'inherit' });

    console.log('Installing Tailwind CSS...');
    execSync('npm install -D tailwindcss postcss autoprefixer', { cwd: appPath, stdio: 'inherit' });
    execSync('npx tailwindcss init -p', { cwd: appPath, stdio: 'inherit' });

    const tailwindConfig = `module.exports = {
      content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    };`;
    fs.writeFileSync(path.join(appPath, 'tailwind.config.js'), tailwindConfig);

    const globalCss = `@tailwind base;
@tailwind components;
@tailwind utilities;`;
    fs.mkdirSync(path.join(appPath, 'styles'));
    fs.writeFileSync(path.join(appPath, 'styles/globals.css'), globalCss);

    console.log(`Created ${appname} with Redux and Tailwind CSS setup.`);
    console.log('Run the following commands to get started:');
    console.log(`  cd ${appname}`);
    console.log('  npm run dev');
  });

program.parse(process.argv);
