#!/usr/bin/env node

/**
 * 🚀 Release Helper Script
 * Automates the release process with proper semantic versioning
 * @author Remco Stoeten
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function exec(command) {
  console.log(`\n🔄 Executing: ${command}`);
  try {
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    process.exit(1);
  }
}

function updateChangelog(newVersion) {
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  
  if (fs.existsSync(changelogPath)) {
    let changelog = fs.readFileSync(changelogPath, 'utf8');
    const today = new Date().toISOString().split('T')[0];
    
    // Replace [Unreleased] with the new version
    changelog = changelog.replace(
      '## [Unreleased]',
      `## [Unreleased]\n\n## [${newVersion}] - ${today}`
    );
    
    fs.writeFileSync(changelogPath, changelog);
    console.log(`📝 Updated CHANGELOG.md with version ${newVersion}`);
  }
}

function main() {
  const releaseType = process.argv[2];
  
  if (!releaseType || !['patch', 'minor', 'major', 'prerelease'].includes(releaseType)) {
    console.log(`
🚀 Release Helper

Usage: node scripts/release.js [patch|minor|major|prerelease]

Semantic Versioning:
- patch:      Bug fixes (0.0.1 → 0.0.2)
- minor:      New features (0.0.1 → 0.1.0)  
- major:      Breaking changes (0.0.1 → 1.0.0)
- prerelease: Pre-release (0.0.1 → 0.0.2-0)

Current version: ${require('../package.json').version}
`);
    process.exit(1);
  }

  console.log(`🚀 Starting ${releaseType} release...`);
  
  // Get current version
  const currentVersion = require('../package.json').version;
  console.log(`📦 Current version: ${currentVersion}`);
  
  // Build first
  console.log('\n🔨 Building project...');
  exec('npm run build');
  
  // Run any tests (if they exist)
  try {
    const packageJson = require('../package.json');
    if (packageJson.scripts && packageJson.scripts.test) {
      exec('npm test');
    } else {
      console.log('ℹ️ No test script defined, skipping tests');
    }
  } catch (error) {
    console.log('ℹ️ No tests to run or test failed:', error.message);
  }
  
  // Bump version
  console.log(`\n📈 Bumping ${releaseType} version...`);
  exec(`npm version ${releaseType} --no-git-tag-version`);
  
  // Get new version
  const newVersion = require('../package.json').version;
  console.log(`✅ New version: ${newVersion}`);
  
  // Update changelog
  updateChangelog(newVersion);
  
  // Commit changes
  console.log('\n📝 Committing changes...');
  exec('git add .');
  exec(`git commit -m "chore: release v${newVersion}"`);
  
  // Create tag
  console.log('\n🏷️ Creating git tag...');
  exec(`git tag v${newVersion}`);
  
  console.log(`
✅ Release v${newVersion} completed!

Next steps:
1. Push to repository: git push && git push --tags
2. Create GitHub release (optional)
3. Publish to npm (optional): npm publish

🎉 Happy releasing!
`);
}

if (require.main === module) {
  main();
}
