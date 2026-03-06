#!/bin/bash

# HCP GitHub Push Script
# Usage: ./push-to-github.sh

set -e

cd "$(dirname "$0")"

echo "🚀 Pushing HCP to GitHub..."

# Force SSH protocol for all remote operations
git remote set-url origin git@github.com:cn3y/HCP.git

# Push to a feature branch
BRANCH_NAME="gh-security-golf-$(date +%Y%m%d)"
echo "Creating branch: $BRANCH_NAME"
git push origin HEAD:$BRANCH_NAME

echo "✅ Pushed to $BRANCH_NAME"
echo "Creating PR..."
gh pr create \
  --title "🔒 Security fixes & ⛳ Golf design upgrade" \
  --body "## Security Fixes
- CORS origin now domain-based (replaced wildcard \`*\`)
- Added input sanitization for notes fields (XSS prevention)
- Created k8s Secret/ConfigMap for production CORS config

## Golf Design Upgrade
- Enhanced color palette (golf-gold, golf-sand, forest greens)
- Golf ball dimple pattern overlay
- Course background gradients
- Trophy icons and best shot highlighting
- Professional scorecard design

**Files changed:** 13 modified, 1 new file

Security: ✅ CORS + XSS fixes
Design: ✅ Golf paradise mode" \
  --base main \
  --head $BRANCH_NAME

echo "✅ PR created!"
echo "View at: https://github.com/cn3y/HCP/pulls"
