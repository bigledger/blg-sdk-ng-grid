#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script to publish packages to GitHub Packages
 * This script publishes all built packages to the GitHub npm registry
 */

const DIST_DIR = path.join(__dirname, '../dist/libs');
const PACKAGE_VERSION = process.env.PACKAGE_VERSION || '0.0.1';
const NODE_AUTH_TOKEN = process.env.NODE_AUTH_TOKEN;

function execCommand(command, cwd = process.cwd(), options = {}) {
  console.log(`🔧 Running: ${command}`);
  try {
    const result = execSync(command, {
      cwd,
      stdio: 'inherit',
      encoding: 'utf8',
      ...options
    });
    return result;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    throw error;
  }
}

function publishPackage(packageDir) {
  const packagePath = path.join(DIST_DIR, packageDir);
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`⚠️  Skipping ${packageDir}: package.json not found`);
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log(`\n📦 Publishing ${packageJson.name}@${packageJson.version}...`);

  try {
    // Check if package already exists
    try {
      execCommand(
        `npm view ${packageJson.name}@${packageJson.version} --registry=${packageJson.publishConfig.registry}`,
        packagePath,
        { stdio: 'pipe' }
      );
      console.log(`⚠️  Package ${packageJson.name}@${packageJson.version} already exists, skipping...`);
      return true;
    } catch (error) {
      // Package doesn't exist, continue with publishing
      console.log(`📋 Package ${packageJson.name}@${packageJson.version} not found, publishing...`);
    }

    // Publish the package
    execCommand('npm publish', packagePath);
    console.log(`✅ Successfully published ${packageJson.name}@${packageJson.version}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to publish ${packageJson.name}:`, error.message);
    return false;
  }
}

function verifyAuthentication() {
  if (!NODE_AUTH_TOKEN) {
    console.error('❌ NODE_AUTH_TOKEN environment variable is required');
    console.error('Please set NODE_AUTH_TOKEN with your GitHub Personal Access Token');
    process.exit(1);
  }

  try {
    execCommand('npm whoami --registry=https://npm.pkg.github.com', process.cwd(), { stdio: 'pipe' });
    console.log('✅ Authentication verified');
  } catch (error) {
    console.error('❌ Authentication failed');
    console.error('Please check your NODE_AUTH_TOKEN and ensure it has the correct permissions');
    process.exit(1);
  }
}

function main() {
  console.log('🚀 Publishing packages to GitHub Packages...\n');
  console.log(`📋 Version: ${PACKAGE_VERSION}`);
  console.log(`📁 Distribution directory: ${DIST_DIR}\n`);

  // Verify authentication
  verifyAuthentication();

  // Check if distribution directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Distribution directory not found. Please run build first.');
    process.exit(1);
  }

  // Get all library directories
  const libDirs = fs.readdirSync(DIST_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  if (libDirs.length === 0) {
    console.error('❌ No packages found to publish');
    process.exit(1);
  }

  console.log(`📦 Found ${libDirs.length} packages to publish:\n`);

  const results = {
    successful: [],
    failed: [],
    skipped: []
  };

  // Publish each package
  libDirs.forEach(libDir => {
    try {
      const success = publishPackage(libDir);
      if (success) {
        const packageJsonPath = path.join(DIST_DIR, libDir, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        results.successful.push(`${packageJson.name}@${packageJson.version}`);
      } else {
        results.failed.push(libDir);
      }
    } catch (error) {
      console.error(`❌ Error publishing ${libDir}:`, error.message);
      results.failed.push(libDir);
    }
  });

  // Print summary
  console.log('\n📊 Publishing Summary:');
  console.log(`   ✅ Successful: ${results.successful.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);
  console.log(`   ⏭️  Skipped: ${results.skipped.length}`);

  if (results.successful.length > 0) {
    console.log('\n✅ Successfully published packages:');
    results.successful.forEach(pkg => console.log(`   • ${pkg}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed to publish packages:');
    results.failed.forEach(pkg => console.log(`   • ${pkg}`));
  }

  // Create installation instructions
  if (results.successful.length > 0) {
    console.log('\n📋 Installation Instructions:');
    console.log('1. Configure npm to use GitHub Packages:');
    console.log('   echo "@bigledger:registry=https://npm.pkg.github.com" >> .npmrc');
    console.log('\n2. Install packages:');
    results.successful.forEach(pkg => {
      const packageName = pkg.split('@')[1]; // Remove version
      console.log(`   npm install @${packageName}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n⚠️  Some packages failed to publish. Please check the logs above.');
    process.exit(1);
  }

  console.log('\n🎉 All packages published successfully!');
}

if (require.main === module) {
  main();
}

module.exports = { publishPackage };