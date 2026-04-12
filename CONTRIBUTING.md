# Contributing to Untangled HTML

First off, thank you for considering contributing to Untangled HTML! It's people like you who make the developer community such a great place.

## 🏁 Quick Start

To set up your development environment:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/RahulDhole/untangled-html.git
    cd untangled-html
    ```
2.  **Install dependencies**:
    ```bash
    pnpm install
    # or use the dev script
    pnpm run dev
    ```
3.  **Start Debugging**:
    - Open the project in VS Code.
    - Press `F5` or go to the **Run and Debug** sidebar and click **Extension**.
    - This will open a new "Extension Development Host" window where you can test the extension.

---

## 🏗 Project Architecture

Untangled HTML is designed to be lightweight and fast. Here is how it works:

### Core Logic (`src/extension.js`)
The extension manipulates the **VS Code Token Color Customizations** to hide or show angle brackets.

1.  **Scopes**: We target specific TextMate scopes that define HTML brackets:
    - `punctuation.definition.tag.html`
    - `punctuation.definition.tag.begin.html`
    - `punctuation.definition.tag.end.html`
2.  **Toggling**: 
    - When enabled, we set the `foreground` color of these scopes to match the editor's current `background` color. This makes them "invisible" while remaining interactive.
    - When disabled, we remove the custom rules from the `textMateRules` array.
3.  **Configuration**: Changes are applied at the **Workspace** level (`vscode.ConfigurationTarget.Workspace`) to avoid messing with a user's global settings.

### Key Files
- `package.json`: Contains extension metadata, commands, and scripts.
- `src/extension.js`: The main entry point and toggle logic.
- `assets/`: Contains marketing materials and icons.
- `samples/`: A collection of HTML, Vue, and JSX files to test the extension locally.

---

## 🧪 Testing with Samples

To verify the extension is working correctly:
1.  Open the `samples/` folder in the **Extension Development Host**.
2.  Open `basic.html`, `component.vue`, or `app.jsx`.
3.  Run the **Toggle HTML Angle Brackets** command.
4.  Verify that all angle brackets (`<`, `>`, `/`) are appropriately hidden or shown.


---

## 🛠 Development Workflow

### Adding New Language Support
If you want to add support for a new language (e.g., Svelte or Blade):
1.  Identify the TextMate scopes for angle brackets in that language (use the `Developer: Inspect Editor Tokens and Scopes` command in VS Code).
2.  Add those scopes to the `bracketScopes` array in `src/extension.js`.
3.  Test it in the Extension Development Host.

### Linting
We use ESLint to maintain code quality. Please run the linter before submitting a PR:
```bash
pnpm run lint
```

---

## 📜 Pull Request Process

1.  **Branching**: Create a feature branch (`feat/your-feature` or `fix/your-bug`).
2.  **Documentation**: If you're adding a feature, update the `README.md` if necessary.
3.  **PR Description**: Clearly describe what your change does and why it's needed.
4.  **Review**: Wait for a review and address any feedback.

## 💬 Communication

If you have questions or want to discuss a new feature, feel free to:
- Open an [Issue](https://github.com/RahulDhole/untangled-html/issues).
- Start a Discussion on GitHub.

Thank you for helping us keep HTML untangled! 🧶
