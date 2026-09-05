---
title: VS Code settings
description: My VS Code user settings. Dank Mono with ligatures, relaxed line height, no minimap, inlay hints on.
path: ~/.config/Code/User/settings.json
lang: jsonc
order: 1
gist:
  id: dc74c846d1e701c65779fdaf7d58e1bf
  file: vscode setting
---

{
// editor
"editor.fontFamily": "'Dank Mono', 'Operator Mono Lig'",
"editor.fontLigatures": true,
"editor.fontSize": 15,
"editor.fontWeight": "bold",
"editor.lineHeight": 2.6,
"editor.inlayHints.enabled": "on",
"editor.cursorSmoothCaretAnimation": "on",
"editor.renderLineHighlight": "all",
"editor.renderWhitespace": "boundary",
"editor.smoothScrolling": true,
"editor.suggestFontSize": 12,
"editor.minimap.enabled": false,
"editor.gotoLocation.multipleDefinitions": "goto",
"editor.gotoLocation.multipleDeclarations": "goto",
"editor.quickSuggestions": {
"other": "on",
"comments": "inline",
"strings": "inline"
},
"notebook.insertFinalNewline": true,

"references.preferredLocation": "view",

"workbench.editor.editorActionsLocation": "hidden",
"workbench.activityBar.location": "default",
// "workbench.sideBar.location": "right",
"workbench.list.smoothScrolling": true,
"workbench.tree.indent": 13,
"workbench.tree.renderIndentGuides": "onHover",

"search.decorations.badges": false,
"search.quickOpen.includeHistory": false,

"scm.diffDecorationsGutterWidth": 2,

"window.titleBarStyle": "native",
"window.nativeTabs": true,
"window.commandCenter": true,

"zenMode.hideLineNumbers": false,
"zenMode.centerLayout": false,

"explorer.autoReveal": true,
"explorer.incrementalNaming": "smart",

"javascript.inlayHints.functionLikeReturnTypes.enabled": true,
"javascript.referencesCodeLens.enabled": true,
"javascript.referencesCodeLens.showOnAllFunctions": true,
"typescript.tsserver.maxTsServerMemory": 6000,

// terminal
"terminal.integrated.fontSize": 13,
"terminal.integrated.fontFamily": "'Comic Mono', 'DankMono Nerd Font', 'OperatorMonoLig Nerd Font Mono'",
"terminal.integrated.lineHeight": 1.5,
// git
"git.autofetch": true,
"git.confirmSync": false,
"git.fetchOnPull": true,
"git.enableSmartCommit": true,
// files
"files.autoSave": "onWindowChange",
"files.insertFinalNewline": true,
"files.watcherExclude": {
"**/.git/objects/**": true,
"**/.git/subtree-cache/**": true,
"**/.hg/store/**": true,
"**/node_modules/**": true,
},
"files.exclude": {
"**/.git": true,
"**/.svn": true,
"**/.hg": true,
},
"search.exclude": {
"**/node_modules": true,
"**/bower_components": true,
"**/_.code-search": true
},
"explorer.fileNesting.enabled": true,
"explorer.fileNesting.expand": false,
"explorer.fileNesting.patterns": {
"_.ts": "${basename}.test.ts, ${basename}.spec.ts, ${basename}.tson, ${basename}.config.ts, ${basename}.config.cts, ${basename}.config.mts",
"package.json": "package-lock.json, yarn.lock, pnpm-lock.yaml, pnpm-workspace.yaml, bun.lock, .npmrc",
"_.vue": "${basename}.vue, ${basename}.test.ts, ${basename}.spec.ts, ${basename}.stories.ts",
"docker-compose.yml": "docker-compose.yml, .dockerignore",
"Dockerfile": "docker-compose.yml, .dockerignore, ${basename}._",
".env": ".env.*"
},
"explorer.compactFolders": false,
"explorer.confirmDragAndDrop": false,
"explorer.confirmDelete": false,
// --
"json.schemaDownload.enable": true,
"editor.stickyScroll.enabled": false,
"workbench.colorTheme": "Bearded Theme Monokai Black",
"terminal.integrated.customGlyphs": false,
"chat.mcp.gallery.enabled": true,
"gitlens.ai.model": "vscode",
"gitlens.ai.vscode.model": "copilot:gpt-4.1",
"typescript.experimental.useTsgo": true,
"chat.disableAIFeatures": false,
"javascript.updateImportsOnFileMove.enabled": "always",
"typescript.updateImportsOnFileMove.enabled": "always",
"sonarlint.connectedMode.connections.sonarcloud": [
{
"organizationKey": "jackwestin",
"connectionId": "jackwestin",
"region": "EU"
}
],
"sonarlint.automaticAnalysis": true,
"terminal.integrated.stickyScroll.enabled": false,
"workbench.iconTheme": "material-icon-theme",
"github.copilot.nextEditSuggestions.enabled": true,
"chat.extensionTools.enabled": true,
"diffEditor.ignoreTrimWhitespace": false,
"svelte.enable-ts-plugin": true
}
