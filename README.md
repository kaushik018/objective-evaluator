# Objective Evaluator - Software Performance Monitoring

**Live Application**: https://objective-evaluator.lovable.app/

A comprehensive software monitoring platform that tracks performance, uptime, and integration health across your development stack.

## Features

- **Repository Integration**: Import and monitor GitHub/GitLab repositories
- **Performance Analysis**: Automated testing of web applications and APIs  
- **Real-time Monitoring**: Track uptime, response times, and status codes
- **Dashboard Analytics**: Visual insights into your software portfolio
- **Role-based Access**: Team collaboration with admin/manager/user roles

## Project Development

**Lovable Project URL**: https://lovable.dev/projects/5b6b50a4-4b17-4cac-b3b2-b62415e6a53e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5b6b50a4-4b17-4cac-b3b2-b62415e6a53e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5b6b50a4-4b17-4cac-b3b2-b62415e6a53e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Repository Testing Guidelines

To get meaningful analysis of your imported repositories, follow these best practices:

### For Web Applications
- **Include live demo URL** in your README.md file or package.json `homepage` field
- **Deploy to platforms** like Vercel, Netlify, GitHub Pages, or Heroku
- **Document the live URL** clearly in your repository description

### For APIs and Backend Services  
- **Document live endpoints** in README with base URL and example requests
- **Include API documentation** (OpenAPI/Swagger specs)
- **Provide testing endpoints** or health check URLs
- **Deploy to cloud platforms** with accessible endpoints

### For Libraries and Packages
- **Publish to package managers** (npm, PyPI, Maven, etc.)
- **Include installation and usage examples** in README
- **Maintain version tags** and release notes
- **Document breaking changes** clearly

### For All Repository Types
- **Write comprehensive README** with setup instructions
- **Include status badges** for CI/CD, tests, coverage
- **Maintain regular commit activity** (shows active development)
- **Respond to issues and PRs** promptly
- **Use semantic versioning** for releases
- **Keep dependencies updated** for security

### Analysis Criteria
The platform evaluates repositories based on:
- **Accessibility**: Can the software be accessed/tested live?
- **Documentation Quality**: README completeness, setup instructions, examples
- **Development Activity**: Recent commits, issue resolution, maintenance
- **Deployment Status**: Live URLs, published packages, demo availability
- **Code Health**: Dependencies, security, build status

### Pro Tips
- Add a "Demo" or "Live Site" section to your README
- Use GitHub Pages for frontend projects
- Deploy backend APIs to free tiers of cloud providers
- Include screenshots and usage examples
- Set up automated deployments from your main branch
