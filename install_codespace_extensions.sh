#!/usr/bin/env bash

echo "Installing core VS Code extensions..."

code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension eamodio.gitlens
code --install-extension christian-kohler.path-intellisense
code --install-extension formulahendry.auto-rename-tag
code --install-extension formulahendry.auto-close-tag
code --install-extension usernamehw.errorlens
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension naumovs.color-highlight
code --install-extension PKief.material-icon-theme
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension ms-vscode.live-server
code --install-extension ms-vscode.vscode-json
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat

echo
echo "Done. Reload VS Code window if needed."
