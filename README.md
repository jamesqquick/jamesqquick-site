Astro Blog Starter Kit
Welcome to the Astro Blog Starter Kit! This template is designed to help you quickly set up a performant, SEO-friendly blog with minimal styling. It comes with essential features like a sitemap, RSS feed, and supports Markdown & MDX content.

Features
✅ Minimal Styling (customize to make it your own)
✅ 100/100 Lighthouse Performance
✅ SEO-Friendly (includes canonical URLs and OpenGraph data)
✅ Sitemap Support
✅ RSS Feed Support
✅ Markdown & MDX Support
🧑‍🚀 Getting Started
To set up the project, follow these simple steps:

1. Clone or Download the Project
You can either clone this repository using Git or download the ZIP and extract it:

bash
Copy code
git clone https://github.com/yourusername/astro-blog.git
cd astro-blog

2. Install Dependencies
Run the following command to install the required dependencies:

bash
Copy code
npm install

3. Run Development Server
Start the development server and open the site at http://localhost:3000:

bash
Copy code
npm run dev

4. Build for Production
When you’re ready to deploy, run the following command to build your site for production:

bash
Copy code
npm run build

5. Preview Production Build
To preview your production build locally before deploying, use:

bash
Copy code
npm run preview
🧑‍💻 Project Structure
Here’s a breakdown of the folders and files in the project:

php
Copy code
├── public/               # Static assets (images, favicon, etc.)
├── src/
│   ├── components/       # Astro components (React, Vue, Svelte, etc.)
│   ├── layouts/          # Layouts used for pages
│   └── pages/            # Pages of the site (Astro, Markdown, etc.)
├── astro.config.mjs      # Astro configuration file
├── README.md             # Project documentation
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration (if using TypeScript)
src/pages/
Astro looks for .astro or .md files in the src/pages/ directory. Each page is exposed as a route based on its file name. For example, src/pages/index.astro will be available at http://localhost:3000/.

src/components/
The src/components/ directory is where you can store reusable components (like buttons, headers, footers, etc.). You can use Astro components or integrate React/Vue/Svelte/Preact components here.

public/
The public/ directory is where you place static assets like images, fonts, and icons. These files will be copied as-is to the dist/ folder during the build process.

🤝 How to Contribute
We welcome contributions to this project! Here's how you can get involved:

1. Fork the Repository
Click the Fork button on the repository page to create your own copy of the project.

2. Create a New Branch
Before making any changes, create a new branch:

bash
Copy code
git checkout -b my-contribution
3. Make Your Changes
Feel free to make any changes, whether it’s fixing bugs, improving documentation, or adding new features.

4. Run Tests
If you’ve added or modified any code, make sure to run the tests to check for any issues:

bash
Copy code
npm run test
5. Commit Your Changes
Once you’re happy with the changes, commit them to your branch:

bash
Copy code
git commit -m "Added a new feature"
6. Push Your Changes
Push your changes to your forked repository:

bash
Copy code
git push origin my-contribution
7. Create a Pull Request
Go to the original repository and create a pull request from your fork. Make sure to provide a clear description of the changes you've made.

📝 Documentation
Markdown & MDX Support
This blog template supports both Markdown and MDX content. You can create .md files in the src/pages/ folder for basic blog posts or use .mdx files for richer content that includes components.

SEO Features
Astro automatically generates optimized metadata for SEO, including:

Canonical URLs
OpenGraph Data (for social sharing)
Sitemap
RSS Feed
🧞 Commands
Here are some useful commands that you can run from the terminal:

Command	Action

npm install	Installs dependencies
npm run dev	Starts the local development server at localhost:3000
npm run build	Builds your site for production (in ./dist/ folder)
npm run preview	Previews the built site locally
npm run astro ...	Run Astro CLI commands like astro add, astro check
npm run astro --help	Get help using the Astro CLI

👀 Want to Learn More?
Check out Astro’s Documentation.
Join our community on Discord.

💳 Credit
This theme is based on the wonderful Bear Blog and customized for Astro.

