#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to manage version bumping across all packages
 * Supports semantic versioning (major, minor, patch, prerelease)
 */

const ROOT_DIR = path.join(__dirname, '..');
const LIBS_DIR = path.join(ROOT_DIR, 'libs');
const MAIN_PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(MAIN_PACKAGE_JSON, 'utf8'));
  return packageJson.version;
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null
  };
}

function incrementVersion(currentVersion, type, prereleaseId = 'alpha') {
  const parsed = parseVersion(currentVersion);
  
  switch (type) {
    case 'major':
      return `${parsed.major + 1}.0.0`;
    
    case 'minor':
      return `${parsed.major}.${parsed.minor + 1}.0`;
    
    case 'patch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    
    case 'prerelease':
      if (parsed.prerelease) {
        // Increment existing prerelease
        const prereleaseMatch = parsed.prerelease.match(/^(.+)\.(\d+)$/);
        if (prereleaseMatch) {
          const id = prereleaseMatch[1];
          const num = parseInt(prereleaseMatch[2]);
          return `${parsed.major}.${parsed.minor}.${parsed.patch}-${id}.${num + 1}`;
        } else {
          return `${parsed.major}.${parsed.minor}.${parsed.patch}-${parsed.prerelease}.1`;
        }
      } else {
        // Create new prerelease
        return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}-${prereleaseId}.0`;
      }
    
    case 'prepatch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}-${prereleaseId}.0`;
    
    case 'preminor':
      return `${parsed.major}.${parsed.minor + 1}.0-${prereleaseId}.0`;
    
    case 'premajor':
      return `${parsed.major + 1}.0.0-${prereleaseId}.0`;
    
    default:
      throw new Error(`Unknown version increment type: ${type}`);
  }
}

function updatePackageVersion(packagePath, newVersion) {
  if (!fs.existsSync(packagePath)) {
    console.warn(`⚠️  Package.json not found at ${packagePath}`);
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const oldVersion = packageJson.version;
  packageJson.version = newVersion;
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated ${packageJson.name}: ${oldVersion} → ${newVersion}`);
  return true;
}

function updateAllPackageVersions(newVersion) {
  console.log(`📦 Updating all packages to version ${newVersion}...\n`);
  
  // Update main package.json
  updatePackageVersion(MAIN_PACKAGE_JSON, newVersion);
  
  // Update all library package.json files
  const libDirs = fs.readdirSync(LIBS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  libDirs.forEach(libDir => {
    const packagePath = path.join(LIBS_DIR, libDir, 'package.json');
    updatePackageVersion(packagePath, newVersion);
  });

  console.log(`\n✅ Updated ${libDirs.length + 1} packages to version ${newVersion}`);
}

function createGitTag(version, message) {
  try {
    console.log(`🏷️  Creating git tag v${version}...`);
    execSync(`git add .`);
    execSync(`git commit -m "chore: bump version to ${version}"`);
    execSync(`git tag -a v${version} -m "${message}"`);
    console.log(`✅ Created git tag v${version}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create git tag: ${error.message}`);
    return false;
  }
}

function generateChangelogEntry(version, type) {
  const date = new Date().toISOString().split('T')[0];
  const typeDescriptions = {
    major: 'Major release with breaking changes',
    minor: 'Minor release with new features',
    patch: 'Patch release with bug fixes',
    prerelease: 'Prerelease version',
    prepatch: 'Prerelease patch version',
    preminor: 'Prerelease minor version',
    premajor: 'Prerelease major version'
  };
  
  return `## [${version}] - ${date}

### ${typeDescriptions[type] || 'Version update'}

- Version bump to ${version}
`;
}

function updateChangelog(version, type) {
  const changelogPath = path.join(ROOT_DIR, 'CHANGELOG.md');
  const entry = generateChangelogEntry(version, type);
  
  if (fs.existsSync(changelogPath)) {
    const changelog = fs.readFileSync(changelogPath, 'utf8');
    const lines = changelog.split('\n');
    
    // Find the insertion point (after the header)
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('# Changelog') || lines[i].startsWith('# CHANGELOG')) {
        insertIndex = i + 2; // After header and empty line
        break;
      }
    }
    
    lines.splice(insertIndex, 0, entry);
    fs.writeFileSync(changelogPath, lines.join('\n'));
  } else {
    const initialChangelog = `# Changelog

All notable changes to this project will be documented in this file.

${entry}`;
    fs.writeFileSync(changelogPath, initialChangelog);
  }
  
  console.log(`✅ Updated CHANGELOG.md with version ${version}`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node version-bump.js <type> [options]');
    console.log('');
    console.log('Types:');
    console.log('  major     - 1.0.0 → 2.0.0');
    console.log('  minor     - 1.0.0 → 1.1.0');
    console.log('  patch     - 1.0.0 → 1.0.1');
    console.log('  prerelease- 1.0.0 → 1.0.1-alpha.0');
    console.log('  prepatch  - 1.0.0 → 1.0.1-alpha.0');
    console.log('  preminor  - 1.0.0 → 1.1.0-alpha.0');
    console.log('  premajor  - 1.0.0 → 2.0.0-alpha.0');
    console.log('');
    console.log('Options:');
    console.log('  --tag           Create git tag');
    console.log('  --no-commit     Skip git commit');
    console.log('  --prerelease-id Prerelease identifier (default: alpha)');
    console.log('');
    console.log('Examples:');
    console.log('  node version-bump.js patch --tag');
    console.log('  node version-bump.js prerelease --prerelease-id beta');
    process.exit(1);
  }

  const type = args[0];
  const shouldTag = args.includes('--tag');
  const shouldCommit = !args.includes('--no-commit');
  const prereleaseIdIndex = args.indexOf('--prerelease-id');
  const prereleaseId = prereleaseIdIndex !== -1 && args[prereleaseIdIndex + 1] 
    ? args[prereleaseIdIndex + 1] 
    : 'alpha';

  const currentVersion = getCurrentVersion();
  console.log(`📋 Current version: ${currentVersion}`);
  
  try {
    const newVersion = incrementVersion(currentVersion, type, prereleaseId);
    console.log(`📋 New version: ${newVersion}\n`);
    
    // Update all package versions
    updateAllPackageVersions(newVersion);
    
    // Update changelog
    updateChangelog(newVersion, type);
    
    // Create git tag if requested
    if (shouldTag && shouldCommit) {
      const message = `Release version ${newVersion}`;
      createGitTag(newVersion, message);
    }
    
    console.log('\n🎉 Version bump completed successfully!');
    console.log(`📦 All packages updated to version ${newVersion}`);
    
    if (shouldTag) {
      console.log(`🏷️  Git tag v${newVersion} created`);
      console.log('📤 Push tags with: git push origin --tags');
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getCurrentVersion,
  parseVersion,
  incrementVersion,
  updateAllPackageVersions
};