#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to prepare packages for publishing to GitHub Packages
 * This script updates package.json files with proper scoping and registry configuration
 */

const LIBS_DIR = path.join(__dirname, '../libs');
const DIST_DIR = path.join(__dirname, '../dist/libs');
const PACKAGE_VERSION = process.env.PACKAGE_VERSION || '0.0.1';
const IS_PRERELEASE = process.env.IS_PRERELEASE === 'true';

// Package mappings from current names to scoped names
const PACKAGE_MAPPINGS = {
  '@ng-ui/grid': '@bigledger/ng-ui-grid',
  '@ng-ui/common': '@bigledger/ng-ui-core',
  '@ng-ui/column': '@bigledger/ng-ui-column',
  '@ng-ui/row': '@bigledger/ng-ui-row',
  '@ng-ui/cell': '@bigledger/ng-ui-cell',
  '@ng-ui/data': '@bigledger/ng-ui-data',
  '@ng-ui/theme': '@bigledger/ng-ui-theme',
  '@ng-ui/charts': '@bigledger/ng-ui-charts-core',
  '@ng-ui/charts-2d': '@bigledger/ng-ui-charts-2d',
  '@ng-ui/charts-3d': '@bigledger/ng-ui-charts-3d',
  '@ng-ui/charts-animations': '@bigledger/ng-ui-charts-animations',
  '@ng-ui/editor-core': '@bigledger/ng-ui-editor-core',
  '@ng-ui/editor-formats': '@bigledger/ng-ui-editor-formats',
  '@ng-ui/editor-media': '@bigledger/ng-ui-editor-media',
  '@ng-ui/editor-plugins': '@bigledger/ng-ui-editor-plugins',
  '@ng-ui/editor-tables': '@bigledger/ng-ui-editor-tables',
  '@ng-ui/editor-themes': '@bigledger/ng-ui-editor-themes',
  '@ng-ui/editor-toolbar': '@bigledger/ng-ui-editor-toolbar',
  '@ng-ui/export': '@bigledger/ng-ui-export'
};

// Dependencies that should be updated to use scoped names
const INTERNAL_DEPENDENCIES = new Set([
  '@ng-ui/grid', '@ng-ui/common', '@ng-ui/column', '@ng-ui/row', '@ng-ui/cell',
  '@ng-ui/data', '@ng-ui/theme', '@ng-ui/charts', '@ng-ui/charts-2d', '@ng-ui/charts-3d',
  '@ng-ui/charts-animations', '@ng-ui/editor-core', '@ng-ui/editor-formats',
  '@ng-ui/editor-media', '@ng-ui/editor-plugins', '@ng-ui/editor-tables',
  '@ng-ui/editor-themes', '@ng-ui/editor-toolbar', '@ng-ui/export'
]);

function updatePackageJson(packagePath, packageName) {
  console.log(`📦 Updating ${packageName}...`);
  
  if (!fs.existsSync(packagePath)) {
    console.warn(`⚠️  Package.json not found at ${packagePath}`);
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Update package name to scoped version
  const scopedName = PACKAGE_MAPPINGS[packageJson.name] || packageJson.name;
  packageJson.name = scopedName;
  
  // Update version
  packageJson.version = PACKAGE_VERSION;
  
  // Add repository information
  packageJson.repository = {
    type: 'git',
    url: 'https://github.com/bigledger/blg-sdk-ng-ui-kit.git',
    directory: `libs/${path.basename(path.dirname(packagePath))}`
  };
  
  // Add homepage
  packageJson.homepage = 'https://github.com/bigledger/blg-sdk-ng-ui-kit#readme';
  
  // Add bugs URL
  packageJson.bugs = {
    url: 'https://github.com/bigledger/blg-sdk-ng-ui-kit/issues'
  };
  
  // Add author
  packageJson.author = {
    name: 'BigLedger',
    url: 'https://github.com/bigledger'
  };
  
  // Add license
  if (!packageJson.license) {
    packageJson.license = 'MIT';
  }
  
  // Add publish configuration for GitHub Packages
  packageJson.publishConfig = {
    registry: 'https://npm.pkg.github.com/@bigledger',
    access: 'restricted'
  };
  
  // Add keywords
  packageJson.keywords = packageJson.keywords || [];
  const baseKeywords = ['angular', 'ui', 'components', 'bigledger'];
  if (scopedName.includes('grid')) {
    packageJson.keywords.push(...baseKeywords, 'grid', 'data-grid', 'table');
  } else if (scopedName.includes('chart')) {
    packageJson.keywords.push(...baseKeywords, 'charts', 'data-visualization', 'graphs');
  } else if (scopedName.includes('editor')) {
    packageJson.keywords.push(...baseKeywords, 'editor', 'rich-text', 'wysiwyg');
  } else {
    packageJson.keywords.push(...baseKeywords);
  }
  
  // Remove duplicates
  packageJson.keywords = [...new Set(packageJson.keywords)];
  
  // Update dependencies to use scoped names
  ['dependencies', 'peerDependencies', 'devDependencies'].forEach(depType => {
    if (packageJson[depType]) {
      const updatedDeps = {};
      Object.entries(packageJson[depType]).forEach(([dep, version]) => {
        if (INTERNAL_DEPENDENCIES.has(dep)) {
          updatedDeps[PACKAGE_MAPPINGS[dep] || dep] = version;
        } else {
          updatedDeps[dep] = version;
        }
      });
      packageJson[depType] = updatedDeps;
    }
  });
  
  // Add engines requirement
  packageJson.engines = {
    node: '>=18.0.0',
    npm: '>=9.0.0'
  };
  
  // Ensure sideEffects is set appropriately
  if (packageJson.sideEffects === undefined) {
    packageJson.sideEffects = false;
  }
  
  // Add description if missing
  if (!packageJson.description) {
    if (scopedName.includes('grid')) {
      packageJson.description = 'Enterprise-grade Angular data grid component';
    } else if (scopedName.includes('chart')) {
      packageJson.description = 'Angular chart components for data visualization';
    } else if (scopedName.includes('editor')) {
      packageJson.description = 'Rich text editor components for Angular';
    } else if (scopedName.includes('core')) {
      packageJson.description = 'Core utilities and services for BigLedger Angular UI components';
    } else {
      packageJson.description = 'Angular UI component from BigLedger UI Kit';
    }
  }
  
  // Write updated package.json
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated ${scopedName} (${packageJson.version})`);
}

function main() {
  console.log('🚀 Preparing packages for GitHub Packages...\n');
  console.log(`📋 Version: ${PACKAGE_VERSION}`);
  console.log(`🔖 Prerelease: ${IS_PRERELEASE}`);
  console.log(`📁 Libraries directory: ${LIBS_DIR}`);
  console.log(`📁 Distribution directory: ${DIST_DIR}\n`);

  // Check if distribution directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Distribution directory not found. Please run build first.');
    process.exit(1);
  }

  // Get all library directories
  const libDirs = fs.readdirSync(DIST_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`📦 Found ${libDirs.length} packages to update:\n`);

  // Update each package.json in dist
  libDirs.forEach(libDir => {
    const packagePath = path.join(DIST_DIR, libDir, 'package.json');
    updatePackageJson(packagePath, libDir);
  });

  console.log('\n✅ All packages prepared for publishing!');
  console.log('\n📋 Summary:');
  console.log(`   • ${libDirs.length} packages updated`);
  console.log(`   • Version: ${PACKAGE_VERSION}`);
  console.log(`   • Registry: https://npm.pkg.github.com/@bigledger`);
  console.log(`   • Access: restricted`);
}

if (require.main === module) {
  main();
}

module.exports = { updatePackageJson, PACKAGE_MAPPINGS };