#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to generate changelog entries from git history
 * Creates formatted changelog entries with categorized commits
 */

const ROOT_DIR = path.join(__dirname, '..');
const CHANGELOG_PATH = path.join(ROOT_DIR, 'CHANGELOG.md');
const PACKAGE_VERSION = process.env.PACKAGE_VERSION;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function execCommand(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    return null;
  }
}

function getLatestTag() {
  const tags = execCommand('git tag --sort=-version:refname');
  if (!tags) return null;
  
  const tagList = tags.trim().split('\n').filter(tag => tag.match(/^v?\d+\.\d+\.\d+/));
  return tagList[0] || null;
}

function getCommitsSinceTag(tag) {
  const command = tag 
    ? `git log ${tag}..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short`
    : `git log --pretty=format:"%H|%s|%an|%ad" --date=short --max-count=50`;
    
  const output = execCommand(command);
  if (!output) return [];
  
  return output.trim().split('\n').map(line => {
    const [hash, subject, author, date] = line.split('|');
    return { hash, subject, author, date };
  });
}

function categorizeCommits(commits) {
  const categories = {
    breaking: [],
    features: [],
    fixes: [],
    performance: [],
    refactor: [],
    docs: [],
    tests: [],
    chore: [],
    other: []
  };

  commits.forEach(commit => {
    const subject = commit.subject.toLowerCase();
    
    // Check for breaking changes
    if (subject.includes('breaking') || subject.includes('!:')) {
      categories.breaking.push(commit);
    }
    // Features
    else if (subject.startsWith('feat') || subject.includes('add ') || subject.includes('implement')) {
      categories.features.push(commit);
    }
    // Bug fixes
    else if (subject.startsWith('fix') || subject.includes('bug') || subject.includes('resolve')) {
      categories.fixes.push(commit);
    }
    // Performance improvements
    else if (subject.startsWith('perf') || subject.includes('performance') || subject.includes('optimize')) {
      categories.performance.push(commit);
    }
    // Refactoring
    else if (subject.startsWith('refactor') || subject.includes('refactor')) {
      categories.refactor.push(commit);
    }
    // Documentation
    else if (subject.startsWith('docs') || subject.includes('documentation')) {
      categories.docs.push(commit);
    }
    // Tests
    else if (subject.startsWith('test') || subject.includes('test')) {
      categories.tests.push(commit);
    }
    // Chore
    else if (subject.startsWith('chore') || subject.startsWith('ci') || subject.startsWith('build')) {
      categories.chore.push(commit);
    }
    // Other
    else {
      categories.other.push(commit);
    }
  });

  return categories;
}

function formatCommit(commit) {
  const shortHash = commit.hash.substring(0, 7);
  let subject = commit.subject;
  
  // Remove conventional commit prefixes for cleaner display
  subject = subject.replace(/^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?:\s*/, '');
  
  // Capitalize first letter
  subject = subject.charAt(0).toUpperCase() + subject.slice(1);
  
  return `- ${subject} ([${shortHash}](../../commit/${commit.hash}))`;
}

function generateChangelogEntry(version, categories, previousTag) {
  const date = new Date().toISOString().split('T')[0];
  let entry = `## [${version}] - ${date}\n\n`;
  
  // Add comparison link if we have a previous tag
  if (previousTag) {
    entry += `[Compare changes](../../compare/${previousTag}...v${version})\n\n`;
  }

  // Breaking Changes (highest priority)
  if (categories.breaking.length > 0) {
    entry += `### 💥 BREAKING CHANGES\n\n`;
    categories.breaking.forEach(commit => {
      entry += `${formatCommit(commit)}\n`;
    });
    entry += '\n';
  }

  // New Features
  if (categories.features.length > 0) {
    entry += `### ✨ Features\n\n`;
    categories.features.forEach(commit => {
      entry += `${formatCommit(commit)}\n`;
    });
    entry += '\n';
  }

  // Bug Fixes
  if (categories.fixes.length > 0) {
    entry += `### 🐛 Bug Fixes\n\n`;
    categories.fixes.forEach(commit => {
      entry += `${formatCommit(commit)}\n`;
    });
    entry += '\n';
  }

  // Performance Improvements
  if (categories.performance.length > 0) {
    entry += `### ⚡ Performance Improvements\n\n`;
    categories.performance.forEach(commit => {
      entry += `${formatCommit(commit)}\n`;
    });
    entry += '\n';
  }

  // Refactoring
  if (categories.refactor.length > 0) {
    entry += `### ♻️ Code Refactoring\n\n`;
    categories.refactor.forEach(commit => {
      entry += `${formatCommit(commit)}\n`;
    });
    entry += '\n';
  }

  // Documentation
  if (categories.docs.length > 0) {
    entry += `### 📚 Documentation\n\n`;
    categories.docs.forEach(commit => {
      entry += `${formatCommit(commit)}\n`;
    });
    entry += '\n';
  }

  // Tests
  if (categories.tests.length > 0) {
    entry += `### 🧪 Tests\n\n`;
    categories.tests.forEach(commit => {
      entry += `${formatCommit(commit)}\n`;
    });
    entry += '\n';
  }

  // Other changes
  if (categories.other.length > 0) {
    entry += `### 🔧 Other Changes\n\n`;
    categories.other.forEach(commit => {
      entry += `${formatCommit(commit)}\n`;
    });
    entry += '\n';
  }

  // Chore (usually hidden, but included for completeness)
  if (categories.chore.length > 0) {
    entry += `### 🏠 Maintenance\n\n`;
    categories.chore.forEach(commit => {
      entry += `${formatCommit(commit)}\n`;
    });
    entry += '\n';
  }

  return entry;
}

function updateChangelog(entry) {
  let changelog = '';
  
  if (fs.existsSync(CHANGELOG_PATH)) {
    changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  } else {
    changelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
  }

  // Find insertion point
  const lines = changelog.split('\n');
  let insertIndex = lines.length;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## [') && !lines[i].includes('Unreleased')) {
      insertIndex = i;
      break;
    }
  }

  lines.splice(insertIndex, 0, entry);
  fs.writeFileSync(CHANGELOG_PATH, lines.join('\n'));
}

function generateReleaseNotes(version, categories) {
  let notes = `# Release Notes - ${version}\n\n`;
  
  // Summary
  const totalChanges = Object.values(categories).reduce((sum, commits) => sum + commits.length, 0);
  notes += `This release includes ${totalChanges} changes:\n\n`;
  
  // Breakdown
  const breakdown = [];
  if (categories.breaking.length) breakdown.push(`${categories.breaking.length} breaking change${categories.breaking.length > 1 ? 's' : ''}`);
  if (categories.features.length) breakdown.push(`${categories.features.length} new feature${categories.features.length > 1 ? 's' : ''}`);
  if (categories.fixes.length) breakdown.push(`${categories.fixes.length} bug fix${categories.fixes.length > 1 ? 'es' : ''}`);
  if (categories.performance.length) breakdown.push(`${categories.performance.length} performance improvement${categories.performance.length > 1 ? 's' : ''}`);
  
  if (breakdown.length > 0) {
    notes += `- ${breakdown.join('\n- ')}\n\n`;
  }

  // Installation
  notes += `## 📦 Installation\n\n`;
  notes += `\`\`\`bash\n`;
  notes += `# Configure npm to use GitHub Packages\n`;
  notes += `echo "@bigledger:registry=https://npm.pkg.github.com" >> .npmrc\n\n`;
  notes += `# Install packages\n`;
  notes += `npm install @bigledger/ng-ui-grid@${version}\n`;
  notes += `npm install @bigledger/ng-ui-core@${version}\n`;
  notes += `# ... install other packages as needed\n`;
  notes += `\`\`\`\n\n`;

  // Breaking changes warning
  if (categories.breaking.length > 0) {
    notes += `## ⚠️ Breaking Changes\n\n`;
    notes += `This release contains breaking changes. Please review the changelog carefully and update your code accordingly.\n\n`;
  }

  return notes;
}

function main() {
  console.log('📝 Generating changelog...\n');

  if (!PACKAGE_VERSION) {
    console.error('❌ PACKAGE_VERSION environment variable is required');
    process.exit(1);
  }

  console.log(`📋 Version: ${PACKAGE_VERSION}`);
  
  const previousTag = getLatestTag();
  if (previousTag) {
    console.log(`📋 Previous tag: ${previousTag}`);
  } else {
    console.log('📋 No previous tags found, generating from recent commits');
  }

  const commits = getCommitsSinceTag(previousTag);
  console.log(`📋 Found ${commits.length} commits to process\n`);

  if (commits.length === 0) {
    console.log('⚠️  No commits found since last tag');
    return;
  }

  const categories = categorizeCommits(commits);
  
  // Log summary
  console.log('📊 Commit categories:');
  Object.entries(categories).forEach(([category, commits]) => {
    if (commits.length > 0) {
      console.log(`   ${category}: ${commits.length}`);
    }
  });
  console.log();

  // Generate changelog entry
  const entry = generateChangelogEntry(PACKAGE_VERSION, categories, previousTag);
  
  // Update changelog file
  updateChangelog(entry);
  console.log(`✅ Updated ${CHANGELOG_PATH}`);

  // Generate release notes
  const releaseNotes = generateReleaseNotes(PACKAGE_VERSION, categories);
  const releaseNotesPath = path.join(ROOT_DIR, `RELEASE_NOTES_${PACKAGE_VERSION}.md`);
  fs.writeFileSync(releaseNotesPath, releaseNotes);
  console.log(`✅ Generated ${releaseNotesPath}`);

  console.log('\n🎉 Changelog generation completed!');
}

if (require.main === module) {
  main();
}

module.exports = {
  getCommitsSinceTag,
  categorizeCommits,
  generateChangelogEntry
};