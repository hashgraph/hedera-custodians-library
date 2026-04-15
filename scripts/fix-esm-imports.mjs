#!/usr/bin/env node
/**
 * Post-build script: adds .js extensions to relative imports in lib/esm/
 *
 * Node.js ESM requires explicit file extensions in relative import specifiers.
 * TypeScript with "moduleResolution": "node" doesn't enforce this, so tsc
 * emits files without extensions. This script fixes the compiled output.
 *
 * Handles two cases:
 *   ./foo        → ./foo.js          (when lib/esm/.../foo.js exists)
 *   ./foo        → ./foo/index.js    (when lib/esm/.../foo/ is a directory)
 */

import { readdir, readFile, writeFile, access } from 'fs/promises';
import { join, extname, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ESM_DIR = join(__dirname, '..', 'lib', 'esm');

const SKIP_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.json', '.node']);

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves the correct ESM-compatible path for a relative import.
 * Checks the file system to distinguish file vs directory imports.
 */
async function resolveExtension(importPath, fromFile) {
  if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
    return importPath; // not a relative import
  }
  const ext = extname(importPath);
  if (SKIP_EXTENSIONS.has(ext)) {
    return importPath; // already has a valid extension
  }

  const base = resolve(dirname(fromFile), importPath);

  if (await exists(base + '.js')) {
    return importPath + '.js';
  }
  if (await exists(join(base, 'index.js'))) {
    return importPath + '/index.js';
  }

  // Fallback: add .js
  return importPath + '.js';
}

async function fixImports(code, fromFile) {
  const staticRe =
    /((?:import|export)[^'"]*?from\s+)(["'])(\.{1,2}\/[^'"]*?)\2/g;
  const dynamicRe = /(\bimport\s*\(\s*)(["'])(\.{1,2}\/[^'"]*?)\2(\s*\))/g;

  let result = code;

  const staticMatches = [...code.matchAll(staticRe)];
  for (const match of staticMatches) {
    const [full, keyword, quote, importPath] = match;
    const fixed = await resolveExtension(importPath, fromFile);
    if (fixed !== importPath) {
      result = result.replace(full, `${keyword}${quote}${fixed}${quote}`);
    }
  }

  const dynamicMatches = [...result.matchAll(dynamicRe)];
  for (const match of dynamicMatches) {
    const [full, prefix, quote, importPath, suffix] = match;
    const fixed = await resolveExtension(importPath, fromFile);
    if (fixed !== importPath) {
      result = result.replace(
        full,
        `${prefix}${quote}${fixed}${quote}${suffix}`
      );
    }
  }

  return result;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile() && extname(entry.name) === '.js') {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const files = await walk(ESM_DIR);
  let fixed = 0;
  let unchanged = 0;

  for (const file of files) {
    const original = await readFile(file, 'utf8');
    const patched = await fixImports(original, file);
    if (patched !== original) {
      await writeFile(file, patched, 'utf8');
      fixed++;
    } else {
      unchanged++;
    }
  }

  console.log(
    `ESM import fix: ${fixed} files updated, ${unchanged} already correct (${ESM_DIR})`
  );
}

main().catch((err) => {
  console.error('fix-esm-imports failed:', err);
  process.exit(1);
});
