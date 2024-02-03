# Fresh Cart API

![Logo](./public/logo.png)

## Dependencies

All project dependencies can be found in the *package.json* file.  

### Environment Versions  

- Node.js v20.10.0
- pnpm v8.14.3
  
To install dependencies, run the following command:

```bash
pnpm install
```

After installing all dependencies, create a local .env file and set the following environment variables:

```env
MONGODB_URI=<database connection string>
DB_NAME=<database name>
SECRET=<provided by the team>
BASE_URL=http://localhost:5500
NODE_ENV='development'
ISSUER_BASE_URL=<auth0 issuer base url>
CLIENT_ID=<auth0 application client id>
```

## Git Flow

There are three main branches:

- **development**: for use by all developers and should only be used locally.

- **staging**: a testing environment where code undergoes validation tests.

- **production**: code that will be deployed to the production environment.

When adding a new feature or fix, follow these steps:

1. Create a new branch from origin/staging and name it as follows:

- Feature: feature/feature-name
- Fix: fix/fix-name

```bash
git checkout -b feature/feature-name
```

> Note: The name should be in lowercase and separated by hyphens.

2. Develop and test the feature or fix.

3. Once ready, open a pull request to **development**.

4. Ask another developer to test your code.

5. If everything is satisfactory, open a pull request to **staging**.

6. Your changes will go to **production** after validating other's code in **staging**.
  
Remember to follow the Git flow process to maintain a structured and organized development workflow.

## Files Structure

Below is an overview of the main directories:

```text
├───public
├───src
│   ├───controllers
│   ├───database
│   ├───models
│   ├───routes
│   ├───services
│   └───utils
└───tests
```