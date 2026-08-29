# Contributing to CRM-Smart-Tracker

First off, thank you for considering contributing to CRM-Smart-Tracker!

We welcome contributions in the form of bug reports, feature suggestions, and code pull requests. Please take a moment to read this document to make the process smooth and effective for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs
- Check if the issue already exists in the [Issues](https://github.com/jun-bolony/CRM-Smart-Tracker/issues).
- If not, create a new issue using the **Bug Report** template.
- Include clear steps to reproduce, your environment (OS, browser), and any logs/errors.

### Suggesting Enhancements
- Open a new issue with the **Feature Request** template.
- Clearly describe the problem you want to solve and the suggested solution.

### Submitting Code (Pull Requests)
1. **Fork the repository** and create your branch from `main`.
2. **Branch naming**: Use descriptive names, e.g., `feature/add-export-xlsx` or `fix/table-sort-issue`.
3. **Setting up the development environment**:
   - Clone your fork.
   3.1.  **Backend**:
		- Navigate to `/backend`.
		- Run `npm install`.
		- Copy the environment template: `.env.example`
		- Edit `.env` and fill in your `MONGODB_URI` and `JWT_SECRET`.
		- (Optional) Set `FRONTEND_URL` to your frontend address (default is `http://localhost:5173` for local dev).

   3.2.  **Frontend**:
		- Navigate to `/frontend`.
		- Run `npm install`.
		- Copy the environment template: `.env.example`
		- **Leave `VITE_API_URL` empty** for local development (the Vite proxy will handle it).
   - **Run locally**: Start backend (`npm run dev`) and frontend (`npm run dev`) simultaneously.
4. **Code Style Guidelines (Critical)**:
   - **Frontend (React + TypeScript)**:
     - Use **functional components** with hooks.
     - Use MUI `sx` props for styling (never use `makeStyles`).
     - Use `import type { ... }` for all type imports (due to `verbatimModuleSyntax`).
     - Wrap heavy components (`ApplicationListPage`, `ApplicationTable`) with `React.memo`. Use `useMemo`/`useCallback` where appropriate.
     - All pages must use `export default` for `React.lazy` support.
   - **Backend (Node.js + Express)**:
     - Use **CommonJS** (`require`/`module.exports`).
     - Always wrap async controllers with the `asyncHandler` utility (`backend/utils/asyncHandler.js`).
     - Always return responses in the `ApiResponse` format: `{ success: boolean, data?: any, message?: string }`.
   - **General**:
     - Write all code and comments in **English**.
     - Use meaningful variable and function names.
5. **Testing your changes**:
   - Manually test all affected user scenarios (CRUD, authentication, stats, drag-and-drop).
   - Ensure the build passes: `npm run build` in both `/frontend` and `/backend` (if backend checks exist).
6. **Commit messages**: Use clear, concise messages. Follow the [Conventional Commits](https://www.conventionalcommits.org/) format if possible (e.g., `feat: add dark mode toggle`, `fix: resolve pagination limit issue`).
7. **Open a Pull Request** to the `main` branch of the original repository.
   - Link the PR to the related Issue.
   - Describe what you changed and why.

## Development Tips

- **API Proxy**: The frontend uses a Vite proxy (`/api` -> `localhost:3000`). You don't need to set `VITE_API_URL` locally unless you are testing against a remote backend.
- **Database**: Use MongoDB Atlas (free tier) or a local MongoDB instance.
- **Important Implementation Details** (read these before changing core logic):
  - **Status History**: When updating a status on the backend, always use the atomic `$push` operator to add to `statusHistory` inside `findByIdAndUpdate`.
  - **Validation**: Limit `limit` pagination to a maximum of 50 records. Max 1000 applications per user, max 50 notes per application (each < 1000 chars).
  - **Security**: Never expose `JWT_SECRET` or `MONGODB_URI`. Use environment variables.

## Getting Help

If you have any questions, feel free to open a [Discussion](https://github.com/jun-bolony/CRM-Smart-Tracker/discussions) or ping the maintainer.

Thank you for contributing!