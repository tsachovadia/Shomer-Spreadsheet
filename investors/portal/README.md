# Segula Investor Portal - Frontend

This directory contains the source code for the React-based investor portal.

## Tech Stack

-   **Framework**: React (via Vite)
-   **Language**: TypeScript
-   **UI Components**: shadcn/ui
-   **Styling**: Tailwind CSS

## Development Workflow

### Prerequisites
-   Node.js and npm installed.
-   Firebase CLI installed (`npm install -g firebase-tools`).
-   Make sure you are logged in (`firebase login`).
-   The Apps Script API must be deployed and its URL correctly placed in the components.

### Running the Development Server

To work on the frontend locally, run the following command from this directory (`investors/portal`):

```bash
npm run dev
```
This will start the Vite development server, usually on `http://localhost:8080`.

### Building for Production

When you are ready to deploy, create a production-ready build:

```bash
npm run build
```
This command generates a `dist` folder with the optimized, static assets of the application.

### Deploying to Production

This project is configured for Firebase Hosting. To deploy the contents of the `dist` folder, run:

```bash
firebase deploy
```

---

## Command Line Alias Suggestions

To simplify the workflow, you can add the following aliases to your shell's configuration file (e.g., `~/.zshrc`, `~/.bashrc`).

**1. Alias to Start the Development Server:**
This alias allows you to start the dev server from anywhere in the project.

```bash
# Starts the frontend development server
alias start-portal-dev="cd /Users/thesyrianhammock/Documents/1\\ Projects/shomer\\ spreadsheet/Shomer-Spreadsheet/investors/portal && npm run dev"
```

**2. Alias to Generate a New Password Hash:**
This alias allows you to quickly generate a SHA-256 hash for a new user password.

```bash
# Generates a SHA-256 hash for a given password
alias new-password-hash="python3 /Users/thesyrianhammock/Documents/1\\ Projects/shomer\\ spreadsheet/Shomer-Spreadsheet/investors/scripts/hash_passwords.py"
```
**Usage:**
```bash
new-password-hash "TheNewPassword123"
```

After adding these lines to your config file, restart your terminal or run `source ~/.zshrc` (or your respective file) for the changes to take effect. 