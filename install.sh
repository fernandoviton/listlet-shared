#!/bin/bash
set -e

# Usage: ./install.sh <target-dir> <app-name> [app-title]
# Example: ./install.sh ~/src/my-app myapp "My App Title"

TARGET="$1"
APP_NAME="$2"
APP_TITLE="${3:-$APP_NAME}"

if [ -z "$TARGET" ] || [ -z "$APP_NAME" ]; then
    echo "Usage: ./install.sh <target-dir> <app-name> [app-title]"
    echo "Example: ./install.sh ~/src/my-app myapp \"My App Title\""
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Creating app '$APP_TITLE' ($APP_NAME) in $TARGET..."

mkdir -p "$TARGET"

# Copy shared infrastructure and app files
cp -r "$SCRIPT_DIR/shared" "$TARGET/"
cp -r "$SCRIPT_DIR/.github" "$TARGET/"
cp -r "$SCRIPT_DIR/tests" "$TARGET/"
cp -r "$SCRIPT_DIR/sql" "$TARGET/"
cp "$SCRIPT_DIR/index.html" "$TARGET/"
cp "$SCRIPT_DIR/app.js" "$TARGET/"
cp "$SCRIPT_DIR/app.css" "$TARGET/"
cp "$SCRIPT_DIR/config.js" "$TARGET/"
cp "$SCRIPT_DIR/CLAUDE.md" "$TARGET/"
cp "$SCRIPT_DIR/package.json" "$TARGET/"
cp "$SCRIPT_DIR/jest.config.js" "$TARGET/"
cp "$SCRIPT_DIR/playwright.config.js" "$TARGET/"

# Replace defaults in config.js
sed "s|APP_CONTAINER: 'listlet'|APP_CONTAINER: '$APP_NAME'|; s|APP_TITLE: 'Listlet'|APP_TITLE: '$APP_TITLE'|" "$TARGET/config.js" > "$TARGET/config.js.tmp"
mv "$TARGET/config.js.tmp" "$TARGET/config.js"

# Replace placeholders in CLAUDE.md
sed "s|APP_CONTAINER: 'listlet'|APP_CONTAINER: '$APP_NAME'|; s|APP_TITLE: 'Listlet'|APP_TITLE: '$APP_TITLE'|; s|^# Listlet|# $APP_TITLE|" "$TARGET/CLAUDE.md" > "$TARGET/CLAUDE.md.tmp"
mv "$TARGET/CLAUDE.md.tmp" "$TARGET/CLAUDE.md"

# Copy .gitignore
cp "$SCRIPT_DIR/.gitignore" "$TARGET/"

# Initialize git repo
cd "$TARGET"
git init
git add -A
git commit -m "Initial app from listlet-shared"

echo ""
echo "Done! Next steps:"
echo "  cd $TARGET"
echo "  npm install"
echo "  cp config.js config.local.js   # Edit with your Supabase keys"
echo "  python -m http.server 8000              # Mock mode works without Supabase"
echo "  npm test                                # Run unit tests"
echo "  npm run test:e2e                        # Run E2E tests"
echo ""
echo "To customize: replace app.js and app.css with your own logic."
