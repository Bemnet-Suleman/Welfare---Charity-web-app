# Contributing to Welfare App

Thank you for contributing! Please follow these guidelines.

## Getting Started for Contributors

1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/Welfare---Charity-web-app.git
   cd Welfare---Charity-web-app
   ```

2. **Setup Development Environment**
   ```bash
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with local database credentials
   npm run db:push
   npm run dev
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes & Test**
   - Follow the code style of existing code
   - Test locally before committing
   - Run type checking: `npm run check`

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Open Pull Request**
   - Describe what you changed and why
   - Reference any related issues

## Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Use meaningful variable/function names
- Add comments for complex logic
- Keep functions small and focused

## Before Submitting PR

- [ ] Code builds locally without errors (`npm run build`)
- [ ] No TypeScript errors (`npm run check`)
- [ ] Changes are tested locally
- [ ] `.env.local` is NOT committed
- [ ] No hardcoded credentials or sensitive data

## Project Structure

- `client/src/` – React components and pages
- `server/` – Express backend and routes
- `api/` – Vercel serverless functions
- `migrations/` – Database schema
- `shared/` – Shared types and schemas

## Need Help?

- Check [DEPLOYMENT.md](../DEPLOYMENT.md) for setup help
- Review [QUICK_START.md](../QUICK_START.md) for fastest setup
- Ask questions in GitHub Issues
