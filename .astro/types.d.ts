declare module 'astro:content' {
	export { z } from 'astro/zod';
	export type CollectionEntry<C extends keyof typeof entryMap> =
		(typeof entryMap)[C][keyof (typeof entryMap)[C]] & Render;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<
				import('astro/zod').AnyZodObject,
				import('astro/zod').AnyZodObject
		  >;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	type BaseCollectionConfig<S extends BaseSchema> = {
		schema?: S;
		slug?: (entry: {
			id: CollectionEntry<keyof typeof entryMap>['id'];
			defaultSlug: string;
			collection: string;
			body: string;
			data: import('astro/zod').infer<S>;
		}) => string | Promise<string>;
	};
	export function defineCollection<S extends BaseSchema>(
		input: BaseCollectionConfig<S>
	): BaseCollectionConfig<S>;

	type EntryMapKeys = keyof typeof entryMap;
	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidEntrySlug<C extends EntryMapKeys> = AllValuesOf<(typeof entryMap)[C]>['slug'];

	export function getEntryBySlug<
		C extends keyof typeof entryMap,
		E extends ValidEntrySlug<C> | (string & {})
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getCollection<C extends keyof typeof entryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof typeof entryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	type InferEntrySchema<C extends keyof typeof entryMap> = import('astro/zod').infer<
		Required<ContentConfig['collections'][C]>['schema']
	>;

	type Render = {
		render(): Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	};

	const entryMap: {
		"blog": {
"10-amazing-vs-code-themes-youve-probably-never-heard-of.md": {
  id: "10-amazing-vs-code-themes-youve-probably-never-heard-of.md",
  slug: "10-amazing-vs-code-themes-youve-probably-never-heard-of",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"10-examples-with-css-grid.md": {
  id: "10-examples-with-css-grid.md",
  slug: "10-examples-with-css-grid",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"100k-subscribers-on-youtube-5-things-i-learned.md": {
  id: "100k-subscribers-on-youtube-5-things-i-learned.md",
  slug: "100k-subscribers-on-youtube-5-things-i-learned",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"15-common-beginner-javascript-mistakes.md": {
  id: "15-common-beginner-javascript-mistakes.md",
  slug: "15-common-beginner-javascript-mistakes",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"5-things-i-ve-learned-from-creating-youtube-videos.md": {
  id: "5-things-i-ve-learned-from-creating-youtube-videos.md",
  slug: "5-things-i-ve-learned-from-creating-youtube-videos",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"5-tips-for-crushing-developer-interviews.md": {
  id: "5-tips-for-crushing-developer-interviews.md",
  slug: "5-tips-for-crushing-developer-interviews",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"5-ways-to-customize-vs-code.md": {
  id: "5-ways-to-customize-vs-code.md",
  slug: "5-ways-to-customize-vs-code",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"add-vs-code-to-your-path.md": {
  id: "add-vs-code-to-your-path.md",
  slug: "add-vs-code-to-your-path",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"announcing-advent-of-javascript-a-free-series-of-javascript-challenges.md": {
  id: "announcing-advent-of-javascript-a-free-series-of-javascript-challenges.md",
  slug: "announcing-advent-of-javascript-a-free-series-of-javascript-challenges",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"appwrite-best-developer-tools-on-product-hunt-in-2022.md": {
  id: "appwrite-best-developer-tools-on-product-hunt-in-2022.md",
  slug: "appwrite-developer-tools-product-hunt-2022",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"authenticated-jamstack-app-with-next-js-airtable-auth0-and-tailwind-css.md": {
  id: "authenticated-jamstack-app-with-next-js-airtable-auth0-and-tailwind-css.md",
  slug: "authenticated-jamstack-app-with-next-js-airtable-auth0-and-tailwind-css",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"authentication-experience-from-a-developer-frank-calise.md": {
  id: "authentication-experience-from-a-developer-frank-calise.md",
  slug: "authentication-experience-from-a-developer-frank-calise",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"build-a-javascript-memory-match-game.md": {
  id: "build-a-javascript-memory-match-game.md",
  slug: "build-a-javascript-memory-match-game",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"build-a-javascript-search-bar.md": {
  id: "build-a-javascript-search-bar.md",
  slug: "build-a-javascript-search-bar",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"build-a-pokedex-with-vanilla-javascript-part-2.md": {
  id: "build-a-pokedex-with-vanilla-javascript-part-2.md",
  slug: "build-a-pokedex-with-vanilla-javascript-part-2",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"build-a-pokedex-with-vanilla-javascript.md": {
  id: "build-a-pokedex-with-vanilla-javascript.md",
  slug: "build-a-pokedex-with-vanilla-javascript",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"cloudinary-image-upload-with-nodejs.md": {
  id: "cloudinary-image-upload-with-nodejs.md",
  slug: "cloudinary-image-upload-with-nodejs",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"configure-proxy-in-react.md": {
  id: "configure-proxy-in-react.md",
  slug: "configure-proxy-in-react",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"convert-number-from-decimal-to-hexadecimal.md": {
  id: "convert-number-from-decimal-to-hexadecimal.md",
  slug: "convert-number-from-decimal-to-hexadecimal",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io.md": {
  id: "create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io.md",
  slug: "create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"cs-degree-vs-programming-bootcamp-vs-self-taught.md": {
  id: "cs-degree-vs-programming-bootcamp-vs-self-taught.md",
  slug: "cs-degree-vs-programming-bootcamp-vs-self-taught",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"favorite-vs-code-font-2022.md": {
  id: "favorite-vs-code-font-2022.md",
  slug: "favorite-vs-code-font-2022",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"goals-for-2022.md": {
  id: "goals-for-2022.md",
  slug: "goals-for-2022",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"hello-world.md": {
  id: "hello-world.md",
  slug: "hello-world",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"how-i-prepare-for-conference-talks.md": {
  id: "how-i-prepare-for-conference-talks.md",
  slug: "how-i-prepare-for-conference-talks",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"how-to-create-and-publish-npm-packages.md": {
  id: "how-to-create-and-publish-npm-packages.md",
  slug: "how-to-create-and-publish-npm-packages",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"how-to-redirect-netlify-functions-to-a-simpler-path.md": {
  id: "how-to-redirect-netlify-functions-to-a-simpler-path.md",
  slug: "how-to-redirect-netlify-functions-to-a-simpler-path",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"how-to-test-npm-packages-locally.md": {
  id: "how-to-test-npm-packages-locally.md",
  slug: "how-to-test-npm-packages-locally",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"i-created-a-developer-rap-video-here-s-what-i-learned.md": {
  id: "i-created-a-developer-rap-video-here-s-what-i-learned.md",
  slug: "i-created-a-developer-rap-video-here-s-what-i-learned",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"i-created-my-first-google-chrome-extension.md": {
  id: "i-created-my-first-google-chrome-extension.md",
  slug: "i-created-my-first-google-chrome-extension",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"i-got-corrected-on-my-second-day.md": {
  id: "i-got-corrected-on-my-second-day.md",
  slug: "i-got-corrected-on-my-second-day",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"i-tried-astro.md": {
  id: "i-tried-astro.md",
  slug: "i-tried-astro",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"intro-to-jamstack-what-i-learned.md": {
  id: "intro-to-jamstack-what-i-learned.md",
  slug: "intro-to-jamstack-what-i-learned",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"javascript-array-filter-explained-in-5-minutes.md": {
  id: "javascript-array-filter-explained-in-5-minutes.md",
  slug: "javascript-array-filter-explained-in-5-minutes",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"javascript-callbacks-explained-in-5-minutes.md": {
  id: "javascript-callbacks-explained-in-5-minutes.md",
  slug: "javascript-callbacks-explained-in-5-minutes",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"javascript-trends-2023.md": {
  id: "javascript-trends-2023.md",
  slug: "javascript-trends-2023",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"make-deep-clones-in-javascript-with-structuredclone.md": {
  id: "make-deep-clones-in-javascript-with-structuredclone.md",
  slug: "deep-clones-javascript-structuredclone",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"multiple-datasets-with-gatsby-source-filesystem.md": {
  id: "multiple-datasets-with-gatsby-source-filesystem.md",
  slug: "multiple-datasets-with-gatsby-source-filesystem",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"must-have-sveltekit-extension-for-vs-code-sveltekit-snippets.md": {
  id: "must-have-sveltekit-extension-for-vs-code-sveltekit-snippets.md",
  slug: "must-have-sveltekit-extension-for-vs-code-sveltekit-snippets",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"my-first-week-at-auth0.md": {
  id: "my-first-week-at-auth0.md",
  slug: "my-first-week-at-auth0",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"my-terminal-has-super-powers.md": {
  id: "my-terminal-has-super-powers.md",
  slug: "my-terminal-has-super-powers",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"n+1-part-of-the-auth0-culture.md": {
  id: "n+1-part-of-the-auth0-culture.md",
  slug: "n+1-part-of-the-auth0-culture",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"new-vs-code-extension-for-testing-apis.md": {
  id: "new-vs-code-extension-for-testing-apis.md",
  slug: "new-vs-code-extension-for-testing-apis",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"next-js-10-image-component-a-first-look.md": {
  id: "next-js-10-image-component-a-first-look.md",
  slug: "next-js-10-image-component-a-first-look",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"node-and-express-for-beginners.md": {
  id: "node-and-express-for-beginners.md",
  slug: "node-and-express-for-beginners",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"open-anchor-link-in-new-tab.md": {
  id: "open-anchor-link-in-new-tab.md",
  slug: "open-anchor-link-in-new-tab",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"parse-json-request-body-in-express.md": {
  id: "parse-json-request-body-in-express.md",
  slug: "parse-json-request-body-in-express",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"react-router-in-five-minutes.md": {
  id: "react-router-in-five-minutes.md",
  slug: "react-router-in-five-minutes",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"settings-sync-extension-for-visual-studio-code.md": {
  id: "settings-sync-extension-for-visual-studio-code.md",
  slug: "settings-sync-extension-for-visual-studio-code",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"settings-sync-in-visual-studio-code.md": {
  id: "settings-sync-in-visual-studio-code.md",
  slug: "settings-sync-in-visual-studio-code",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"setup-a-custom-domain-with-netlify.md": {
  id: "setup-a-custom-domain-with-netlify.md",
  slug: "setup-a-custom-domain-with-netlify",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"supercharge-your-git-workflow-with-the-gitlens-vs-code-extension.md": {
  id: "supercharge-your-git-workflow-with-the-gitlens-vs-code-extension.md",
  slug: "supercharge-your-git-workflow-with-the-gitlens-vs-code-extension",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"the-easiest-way-to-add-node-js-user-authentication.md": {
  id: "the-easiest-way-to-add-node-js-user-authentication.md",
  slug: "the-easiest-way-to-add-node-js-user-authentication",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"top-5-pieces-of-advice-for-aspiring-and-learning-developers.md": {
  id: "top-5-pieces-of-advice-for-aspiring-and-learning-developers.md",
  slug: "top-5-pieces-of-advice-for-aspiring-and-learning-developers",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"top-5-struggles-of-a-developer-advocate.md": {
  id: "top-5-struggles-of-a-developer-advocate.md",
  slug: "top-5-struggles-of-a-developer-advocate",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"twilio-node-text-message.md": {
  id: "twilio-node-text-message.md",
  slug: "twilio-node-text-message",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"using-node-watch-instead-of-nodemon.md": {
  id: "using-node-watch-instead-of-nodemon.md",
  slug: "using-node-watch-instead-of-nodemon",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"visual-studio-code-browser-preview-extension.md": {
  id: "visual-studio-code-browser-preview-extension.md",
  slug: "visual-studio-code-browser-preview-extension",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"vs-code-react-setup-5-tips.md": {
  id: "vs-code-react-setup-5-tips.md",
  slug: "vs-code-react-setup-5-tips",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"vscode-git-extensions-2020.md": {
  id: "vscode-git-extensions-2020.md",
  slug: "vscode-git-extensions-2020",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"why-and-how-to-get-started-live-streaming.md": {
  id: "why-and-how-to-get-started-live-streaming.md",
  slug: "why-and-how-to-get-started-live-streaming",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
},
"course": {
"build-a-quiz-app-with-html-css-and-javascript.md": {
  id: "build-a-quiz-app-with-html-css-and-javascript.md",
  slug: "build-a-quiz-app-with-html-css-and-javascript",
  body: string,
  collection: "course",
  data: InferEntrySchema<"course">
},
"design-and-build-a-chat-app-with-socket-io.md": {
  id: "design-and-build-a-chat-app-with-socket-io.md",
  slug: "design-and-build-a-chat-app-with-socket-io",
  body: string,
  collection: "course",
  data: InferEntrySchema<"course">
},
"fullstack-react-and-firebase.md": {
  id: "fullstack-react-and-firebase.md",
  slug: "fullstack-react-and-firebase",
  body: string,
  collection: "course",
  data: InferEntrySchema<"course">
},
"learn-visual-studio-code.md": {
  id: "learn-visual-studio-code.md",
  slug: "learn-visual-studio-code",
  body: string,
  collection: "course",
  data: InferEntrySchema<"course">
},
"react-and-serverless-fullstack-developmnent.md": {
  id: "react-and-serverless-fullstack-developmnent.md",
  slug: "react-and-serverless-fullstack-developmnent",
  body: string,
  collection: "course",
  data: InferEntrySchema<"course">
},
},
"testimonial": {
"bekah.md": {
  id: "bekah.md",
  slug: "bekah",
  body: string,
  collection: "testimonial",
  data: InferEntrySchema<"testimonial">
},
"clark.md": {
  id: "clark.md",
  slug: "clark",
  body: string,
  collection: "testimonial",
  data: InferEntrySchema<"testimonial">
},
"zara.md": {
  id: "zara.md",
  slug: "zara",
  body: string,
  collection: "testimonial",
  data: InferEntrySchema<"testimonial">
},
},

	};

	type ContentConfig = typeof import("../src/content/config");
}
