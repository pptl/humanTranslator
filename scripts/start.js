#!/usr/bin/env node
// Same fix as dev.js — unset ELECTRON_RUN_AS_NODE for preview/start mode.
delete process.env.ELECTRON_RUN_AS_NODE

const { execSync } = require('child_process')
execSync('electron-vite preview', { stdio: 'inherit', env: process.env })
