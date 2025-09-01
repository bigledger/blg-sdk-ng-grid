# GitHub Packages Setup Guide

This guide explains how to set up authentication and configuration for using BigLedger's Angular UI packages from GitHub Packages.

## 🔐 Authentication Setup

### 1. Create a Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give your token a descriptive name: "BigLedger NPM Packages"
4. Set expiration as needed (recommended: 90 days)
5. Select the following scopes:
   - `read:packages` - Download packages from GitHub Packages
   - `write:packages` - Upload packages to GitHub Packages (if publishing)
   - `delete:packages` - Delete packages from GitHub Packages (if needed)
   - `repo` - Access to private repositories (if using private packages)

6. Click "Generate token" and copy the token immediately

### 2. Configure NPM Authentication

#### Option A: Global Configuration (Recommended for development)

Create or update your global `.npmrc` file:

```bash
# Linux/macOS
echo "@bigledger:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc

# Windows
echo @bigledger:registry=https://npm.pkg.github.com >> %USERPROFILE%\.npmrc
echo //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN >> %USERPROFILE%\.npmrc
```

#### Option B: Project-Specific Configuration

1. Copy the template file:
   ```bash
   cp .npmrc.template .npmrc
   ```

2. Edit `.npmrc` and replace `YOUR_GITHUB_TOKEN` with your actual token

3. Add `.npmrc` to your `.gitignore` file:
   ```bash
   echo ".npmrc" >> .gitignore
   ```

### 3. Environment Variables (CI/CD)

For automated environments, set the token as an environment variable:

```bash
export NPM_TOKEN=your_github_token
export NODE_AUTH_TOKEN=your_github_token
```

Or create a `.env` file (don't commit this):
```
NPM_TOKEN=your_github_token
NODE_AUTH_TOKEN=your_github_token
```

## 🏢 Organization Secrets (GitHub Actions)

For GitHub Actions workflows, add these secrets to your organization or repository:

1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `BIGLEDGER_NPM_TOKEN` - Your GitHub PAT for package operations
   - `GH_TOKEN` - GitHub token for releases and changelog generation

## 🔧 Troubleshooting Authentication

### Verify Authentication

Test your authentication setup:

```bash
# Test authentication
npm whoami --registry=https://npm.pkg.github.com

# Test package access
npm view @bigledger/ng-ui-core --registry=https://npm.pkg.github.com
```

### Common Issues

#### 401 Unauthorized
- Check that your token has the correct scopes
- Verify the token hasn't expired
- Ensure the token is correctly set in `.npmrc`

#### 403 Forbidden
- You may not have access to the BigLedger organization
- Contact your administrator to be added to the organization
- Verify you're using the correct package name with `@bigledger/` scope

#### 404 Not Found
- Package may not exist or may not be published yet
- Check the package name and version
- Verify you have access to the repository

#### Token Issues
- Tokens are case-sensitive
- Tokens should not have spaces or extra characters
- Use tokens (classic) rather than fine-grained tokens for GitHub Packages

### Reset Authentication

If you're having persistent issues:

1. Delete existing authentication:
   ```bash
   npm logout --registry=https://npm.pkg.github.com
   ```

2. Clear NPM cache:
   ```bash
   npm cache clean --force
   ```

3. Remove and recreate `.npmrc` configuration

4. Generate a new GitHub PAT

## 🔒 Security Best Practices

### Token Management
- Use descriptive names for your tokens
- Set appropriate expiration dates (90 days recommended)
- Regularly rotate your tokens
- Never commit tokens to version control
- Use environment variables in CI/CD pipelines

### Scope Minimization
- Only grant the minimum required scopes
- Use `read:packages` for consuming packages
- Only add `write:packages` if you need to publish
- Avoid using `repo` scope unless necessary

### Access Control
- Regularly review organization members
- Use teams for package access control
- Monitor package download logs
- Set up audit logging for package operations

## 📦 Registry Configuration

### Multiple Registries

If you need to use both npm and GitHub Packages:

```ini
# .npmrc
@bigledger:registry=https://npm.pkg.github.com
@yourcompany:registry=https://npm.pkg.github.com
registry=https://registry.npmjs.org/

//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### Yarn Configuration

For Yarn users:

```yaml
# .yarnrc.yml
npmRegistries:
  "@bigledger":
    npmRegistryServer: "https://npm.pkg.github.com"
    npmAuthToken: "${NPM_TOKEN}"

npmScopes:
  bigledger:
    npmRegistryServer: "https://npm.pkg.github.com"
    npmAuthToken: "${NPM_TOKEN}"
```

## 🛠️ Development Workflow

### Initial Setup
1. Set up authentication (see above)
2. Install packages
3. Verify installation

### Regular Maintenance
1. Update tokens before expiration
2. Update package versions
3. Review security advisories

### Team Onboarding
1. Create GitHub PAT
2. Configure local authentication
3. Test package installation
4. Document team-specific setup

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Verify your authentication setup
3. Contact your team's package administrator
4. File an issue in the repository

## 🔗 Related Links

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [npm Configuration](https://docs.npmjs.com/cli/v7/configuring-npm)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)