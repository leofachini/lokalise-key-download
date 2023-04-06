# Instructions

This repo was created to download lokalise keys using _Node.js version v16.15.1_

1. Install package.json dependencies with the command `npm ci`
2. In root folder add a `.env` file with the following keys (no worries because it will be only in your local env)
   1. LOKALISE_API_KEY=your_api_key_here
   2. LOKALISE_PROJECT_ID=the_id_of_the_project_in_lokalise
3. Then you run either of these two commands (they execute the same task) `npm run lokalise` or `node index.js`
4. The files will be at `./static/locales/**/*`
