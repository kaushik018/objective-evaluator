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

## Analysis Algorithm Documentation

### Overview
The Objective Evaluator uses a multi-factor scoring system that evaluates software across different dimensions. The algorithms are designed to be deterministic, balanced, and resistant to both overfitting and underfitting.

### Core Principles

1. **No Randomness**: All scores are deterministic based on measurable metrics
2. **Logarithmic Scaling**: Prevents overfitting to viral projects with many stars
3. **Multi-Factor Validation**: Requires multiple indicators for high confidence
4. **Conservative Fallbacks**: Uses neutral scores when verification is impossible
5. **Time Decay**: Recent activity weighs more than historical metrics

### Repository Health Score (40% of total)

Evaluates the overall health and quality of a repository:

```typescript
Base Score: 30% (conservative baseline)

Star Score (max 35%):
- Logarithmic scaling: log10(stars + 1) * 0.15
- Prevents viral repos from dominating
- Caps at 35% contribution

Fork Score (max 15%):
- Logarithmic scaling: log10(forks + 1) * 0.08
- Indicates community involvement
- Caps at 15% contribution

Activity Score (max 25%):
- < 7 days: 25%
- 7-30 days: 20%
- 30-90 days: 12%
- 90-180 days: 6%
- > 180 days: 0%

Maturity Bonus (10%):
- Repo age > 1 year + stars > 5
- Rewards proven projects

Community Health (15%):
- Forks/Stars ratio: 5-30%
- Indicates healthy engagement
- Too few forks = low adoption
- Too many forks = possible abandonment
```

### Live URL Analysis (40% of total)

Tests actual deployment and accessibility:

```typescript
Response Time Scoring:
- < 800ms: 100/100 (excellent)
- 800-1500ms: 95/100 (very good)
- 1500-3000ms: 88/100 (good)
- 3000-5000ms: 78/100 (acceptable)
- 5000-8000ms: 65/100 (slow)
- > 8000ms: 50/100 (poor)

Uptime Estimation:
- Based on response time consistency
- Failed connections: 90% uptime
- Slow responses: 94-96% uptime
- Fast responses: 99.7-99.9% uptime

Fallback Strategy:
- No live URL: 20 points (partial credit)
- Repository without deployment still has value
```

### Documentation Score (10% of total)

Indirect assessment of documentation quality:

```typescript
Base Score: 50% (conservative)

Star-based indicators:
- > 500 stars: +25%
- 100-500 stars: +20%
- 20-100 stars: +10%
- < 20 stars: 0%

Fork indicators:
- > 50 forks: +15%
- 10-50 forks: +8%
- < 10 forks: 0%

Maturity bonus:
- Age > 180 days + stars > 10: +10%

Note: Since we cannot fetch actual README content,
this uses proxies that correlate with good documentation.
```

### Package Publication (10% bonus)

Detects published packages on registries:

```typescript
Requires 2+ indicators for confidence:

JavaScript/TypeScript (npm):
- Name contains: npm-, package, @scope/
- Description mentions: npm, package
- Strong community: stars > 100 + forks > 20

Python (PyPI):
- Name patterns: py-, -py, python-
- Description mentions: pypi
- Strong community: stars > 80 + forks > 15

Java (Maven Central):
- Stars > 150
- Forks > 30
- Maven in name/description

Score = min(1.0, indicators * 0.33)
```

### Uptime Calculation

Represents availability and maintenance consistency:

```typescript
Base: 92% (conservative)

Activity consistency:
- < 14 days: +4%
- 14-60 days: +2.5%
- 60-180 days: +1%
- > 180 days: 0%

Community trust (log scale):
- min(3%, log10(stars + 1) * 1.5)

Live deployment: +2.5%
High fork activity (>20): +1%

Range: Capped between 90-100%
```

### Final Status Classification

```typescript
Excellent: score ≥ 85 AND uptime ≥ 98%
Good: score ≥ 70 AND uptime ≥ 96%
Fair: score ≥ 55 AND uptime ≥ 93%
Poor: score > 0 AND uptime > 0
Pending: score = 0 OR uptime = 0
```

### Website/API Analysis

For non-repository software:

```typescript
Website Performance:
- Timeout: 10 seconds
- Method: HEAD request (lightweight)
- Scoring: Response time based (see Live URL Analysis)

API Performance:
- Timeout: 8 seconds (APIs should be faster)
- Stricter thresholds:
  - < 400ms: 100/100
  - 400-1000ms: 92/100
  - 1000-2000ms: 82/100
  - > 2000ms: 68/100

Failed Connections:
- Conservative neutral score: 40-50/100
- Uptime estimate: 90-95%
- Avoids false negatives from CORS/auth
```

### Anti-Overfitting Measures

1. **Logarithmic Star Scaling**: `log10(stars)` prevents 10K+ star repos from dominating
2. **Multi-Factor Requirements**: Package detection needs 2+ signals
3. **Activity Decay**: Old commits don't count as much as recent ones
4. **Ratio-Based Health**: Stars-to-forks ratio prevents single-metric bias
5. **Conservative Baselines**: Unknown factors get neutral 50% scores

### Anti-Underfitting Measures

1. **Partial Credit Systems**: Repos without URLs still score 50-70
2. **Multiple Pathways**: Can score well via health, deployment, OR packages
3. **Time-Weighted Metrics**: Recent activity gets proper recognition
4. **Maturity Bonuses**: Proven projects get credit for longevity
5. **Comprehensive Factors**: 4 independent scoring dimensions

### Limitations and Transparency

The system acknowledges several limitations:

1. **CORS Restrictions**: Can't fetch full HTTP responses from browser
2. **No README Access**: Documentation score uses proxy indicators
3. **Package Registry Access**: Can't verify actual npm/PyPI publication
4. **Point-in-Time**: Single measurement, not continuous monitoring
5. **No Code Quality Analysis**: Can't inspect actual code patterns

These limitations are compensated by:
- Conservative scoring when uncertain
- Multiple independent verification methods
- Transparent confidence indicators
- Clear documentation of methodology

### Confidence Scoring (Future Feature)

Each analysis will include a confidence score (0-100):

```typescript
High confidence (80-100):
- Live URL verified
- Strong metrics (stars/forks)
- Recent activity
- Package published

Medium confidence (50-80):
- Some metrics verified
- Moderate community
- Older but maintained

Low confidence (0-50):
- Few verifiable metrics
- No live deployment
- Limited activity
- New repository
```

## Technical Implementation

### Stack
- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Auth**: Supabase Auth with Google OAuth
- **Storage**: Supabase Database + RLS policies

### Key Files
- `src/hooks/useSoftwareAnalysis.ts`: Core analysis algorithms
- `src/components/EnhancedSoftwareList.tsx`: Software management UI
- `src/components/RepositoryAnalysisStatus.tsx`: Analysis feedback display
- `supabase/functions/github-integration/`: GitHub API integration
- `supabase/functions/gitlab-integration/`: GitLab API integration

### Database Schema
- `software`: Main software tracking table
- `external_integrations`: GitHub/GitLab repository data
- `performance_logs`: Historical performance metrics
- `activity_logs`: User activity tracking
- `user_roles`: Role-based access control

## Contributing

To improve the analysis algorithms:

1. Add more deployment pattern detection
2. Implement actual package registry API checks (server-side)
3. Add README parsing for documentation scoring
4. Implement continuous monitoring (not just point-in-time)
5. Add more language-specific indicators

Pull requests welcome!
