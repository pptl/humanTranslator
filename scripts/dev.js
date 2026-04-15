#!/usr/bin/env node
// Completely remove ELECTRON_RUN_AS_NODE before spawning electron-vite.
// cross-env ELECTRON_RUN_AS_NODE=0 does NOT work because Electron's C++ layer
// treats any non-empty string value (including '0') as enabling Node mode.
delete process.env.ELECTRON_RUN_AS_NODE

const { execSync } = require('child_process')
// npm run already adds node_modules/.bin to PATH, so electron-vite resolves
// to electron-vite.cmd on Windows via shell execution.
execSync('electron-vite dev', { stdio: 'inherit', env: process.env })
