# Change Log

All notable changes to the "html-no-brackets" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.3] - 2026-04-12

### Added
- **Global Settings Support**: Changed tag visibility settings to store in Global (User) config instead of Workspace config. This prevents repo pollution and `.vscode/settings.json` git diffs.
- **Premium Marketing Assets**: Added high-quality hero banner and updated `README.md` for better VS Code Marketplace and GH Pages presence.
- **Developer Samples**: Added a `samples/` directory with HTML, Vue, and JSX snippets for local testing.
- **Contribution Guide**: New `CONTRIBUTING.md` with architecture details and release instructions.
- **Developer Workflow**: Added `pnpm` scripts (`dev`, `lint`, `package`, `publish`) and PR templates.

### Fixed
- Improved tag scope targeting to be more comprehensive for Vue and JSX.
- Fixed command labeling and metadata typos in `package.json`.

## [0.0.2] - 2026-04-11
- Initial public release versioning.

## [0.0.1]
- Initial creation of the extension logic.