declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}
declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';
	export type CollectionEntry<C extends keyof typeof entryMap> =
		(typeof entryMap)[C][keyof (typeof entryMap)[C]];

	// TODO: Remove this when having this fallback is no longer relevant. 2.3? 3.0? - erika, 2023-04-04
	/**
	 * @deprecated
	 * `astro:content` no longer provide `image()`.
	 *
	 * Please use it through `schema`, like such:
	 * ```ts
	 * import { defineCollection, z } from "astro:content";
	 *
	 * defineCollection({
	 *   schema: ({ image }) =>
	 *     z.object({
	 *       image: image(),
	 *     }),
	 * });
	 * ```
	 */
	export const image: never;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>
			]
		>;
	}>;

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

	export type SchemaContext = { image: ImageFunction };

	type BaseCollectionConfig<S extends BaseSchema> = {
		schema?: S | ((context: SchemaContext) => S);
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

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof typeof entryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	const entryMap: {
		"blog": {
"10-amazing-vs-code-themes-youve-probably-never-heard-of.md": {
  id: "10-amazing-vs-code-themes-youve-probably-never-heard-of.md",
  slug: "10-amazing-vs-code-themes-youve-probably-never-heard-of",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"10-examples-with-css-grid.md": {
  id: "10-examples-with-css-grid.md",
  slug: "10-examples-with-css-grid",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"100k-subscribers-on-youtube-5-things-i-learned.md": {
  id: "100k-subscribers-on-youtube-5-things-i-learned.md",
  slug: "100k-subscribers-on-youtube-5-things-i-learned",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"15-common-beginner-javascript-mistakes.md": {
  id: "15-common-beginner-javascript-mistakes.md",
  slug: "15-common-beginner-javascript-mistakes",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"2023-04-04-3-regrets-from-my-computer-science-degree.md": {
  id: "2023-04-04-3-regrets-from-my-computer-science-degree.md",
  slug: "3-regrets-computer-science-degree",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"2023-04-19-use-ai-to-create-bash-scripts-using-fig.md": {
  id: "2023-04-19-use-ai-to-create-bash-scripts-using-fig.md",
  slug: "ai-create-bash-scripts-fig",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"2023-04-21-is-create-react-app-really-dead.md": {
  id: "2023-04-21-is-create-react-app-really-dead.md",
  slug: "create-react-app-dead",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"2023-04-21-tips-for-handling-and-tracking-errors-in-javascript.md": {
  id: "2023-04-21-tips-for-handling-and-tracking-errors-in-javascript.md",
  slug: "tips-handling-tracking-errors-javascript",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"2023-05-04-5-reasons-developers-regret-their-jobs.md": {
  id: "2023-05-04-5-reasons-developers-regret-their-jobs.md",
  slug: "5-reasons-developers-regret-jobs",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"2023-05-04-how-to-add-openai-to-your-nextjs-project.md": {
  id: "2023-05-04-how-to-add-openai-to-your-nextjs-project.md",
  slug: "add-openai-nextjs-project",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"2023-06-20-5-utility-apps-i-use-every-day-(for-mac).md": {
  id: "2023-06-20-5-utility-apps-i-use-every-day-(for-mac).md",
  slug: "5-utility-apps-mac",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"5-things-i-ve-learned-from-creating-youtube-videos.md": {
  id: "5-things-i-ve-learned-from-creating-youtube-videos.md",
  slug: "5-things-i-ve-learned-from-creating-youtube-videos",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"5-tips-for-crushing-developer-interviews.md": {
  id: "5-tips-for-crushing-developer-interviews.md",
  slug: "5-tips-for-crushing-developer-interviews",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"5-ways-i've-used-chatgpt-in-my-javascript-projects.md": {
  id: "5-ways-i've-used-chatgpt-in-my-javascript-projects.md",
  slug: "5-ways-chatgpt-javascript-projects",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"5-ways-to-customize-vs-code.md": {
  id: "5-ways-to-customize-vs-code.md",
  slug: "5-ways-to-customize-vs-code",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"add-vs-code-to-your-path.md": {
  id: "add-vs-code-to-your-path.md",
  slug: "add-vs-code-to-your-path",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"announcing-advent-of-javascript-a-free-series-of-javascript-challenges.md": {
  id: "announcing-advent-of-javascript-a-free-series-of-javascript-challenges.md",
  slug: "announcing-advent-of-javascript-a-free-series-of-javascript-challenges",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"appwrite-best-developer-tools-on-product-hunt-in-2022.md": {
  id: "appwrite-best-developer-tools-on-product-hunt-in-2022.md",
  slug: "appwrite-developer-tools-product-hunt-2022",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"authenticated-jamstack-app-with-next-js-airtable-auth0-and-tailwind-css.md": {
  id: "authenticated-jamstack-app-with-next-js-airtable-auth0-and-tailwind-css.md",
  slug: "authenticated-jamstack-app-with-next-js-airtable-auth0-and-tailwind-css",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"authentication-experience-from-a-developer-frank-calise.md": {
  id: "authentication-experience-from-a-developer-frank-calise.md",
  slug: "authentication-experience-from-a-developer-frank-calise",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"best-browser-for-web-developers.md": {
  id: "best-browser-for-web-developers.md",
  slug: "browser-web-developers",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"build-a-javascript-memory-match-game.md": {
  id: "build-a-javascript-memory-match-game.md",
  slug: "build-a-javascript-memory-match-game",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"build-a-javascript-search-bar.md": {
  id: "build-a-javascript-search-bar.md",
  slug: "build-a-javascript-search-bar",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"build-a-pokedex-with-vanilla-javascript-part-2.md": {
  id: "build-a-pokedex-with-vanilla-javascript-part-2.md",
  slug: "build-a-pokedex-with-vanilla-javascript-part-2",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"build-a-pokedex-with-vanilla-javascript.md": {
  id: "build-a-pokedex-with-vanilla-javascript.md",
  slug: "build-a-pokedex-with-vanilla-javascript",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"cloudinary-image-upload-with-nodejs.md": {
  id: "cloudinary-image-upload-with-nodejs.md",
  slug: "cloudinary-image-upload-with-nodejs",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"configure-proxy-in-react.md": {
  id: "configure-proxy-in-react.md",
  slug: "configure-proxy-in-react",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"convert-number-from-decimal-to-hexadecimal.md": {
  id: "convert-number-from-decimal-to-hexadecimal.md",
  slug: "convert-number-from-decimal-to-hexadecimal",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io.md": {
  id: "create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io.md",
  slug: "create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"cs-degree-vs-programming-bootcamp-vs-self-taught.md": {
  id: "cs-degree-vs-programming-bootcamp-vs-self-taught.md",
  slug: "cs-degree-vs-programming-bootcamp-vs-self-taught",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"favorite-vs-code-font-2022.md": {
  id: "favorite-vs-code-font-2022.md",
  slug: "favorite-vs-code-font-2022",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"goals-for-2022.md": {
  id: "goals-for-2022.md",
  slug: "goals-for-2022",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"hello-world.md": {
  id: "hello-world.md",
  slug: "hello-world",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"how-i-prepare-for-conference-talks.md": {
  id: "how-i-prepare-for-conference-talks.md",
  slug: "how-i-prepare-for-conference-talks",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"how-to-create-and-publish-npm-packages.md": {
  id: "how-to-create-and-publish-npm-packages.md",
  slug: "how-to-create-and-publish-npm-packages",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"how-to-redirect-netlify-functions-to-a-simpler-path.md": {
  id: "how-to-redirect-netlify-functions-to-a-simpler-path.md",
  slug: "how-to-redirect-netlify-functions-to-a-simpler-path",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"how-to-test-npm-packages-locally.md": {
  id: "how-to-test-npm-packages-locally.md",
  slug: "how-to-test-npm-packages-locally",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"i-created-a-developer-rap-video-here-s-what-i-learned.md": {
  id: "i-created-a-developer-rap-video-here-s-what-i-learned.md",
  slug: "i-created-a-developer-rap-video-here-s-what-i-learned",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"i-created-my-first-google-chrome-extension.md": {
  id: "i-created-my-first-google-chrome-extension.md",
  slug: "i-created-my-first-google-chrome-extension",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"i-got-corrected-on-my-second-day.md": {
  id: "i-got-corrected-on-my-second-day.md",
  slug: "i-got-corrected-on-my-second-day",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"i-tried-astro.md": {
  id: "i-tried-astro.md",
  slug: "i-tried-astro",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"intro-to-jamstack-what-i-learned.md": {
  id: "intro-to-jamstack-what-i-learned.md",
  slug: "intro-to-jamstack-what-i-learned",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"javascript-array-filter-explained-in-5-minutes.md": {
  id: "javascript-array-filter-explained-in-5-minutes.md",
  slug: "javascript-array-filter-explained-in-5-minutes",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"javascript-callbacks-explained-in-5-minutes.md": {
  id: "javascript-callbacks-explained-in-5-minutes.md",
  slug: "javascript-callbacks-explained-in-5-minutes",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"javascript-trends-2023.md": {
  id: "javascript-trends-2023.md",
  slug: "javascript-trends-2023",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"make-deep-clones-in-javascript-with-structuredclone.md": {
  id: "make-deep-clones-in-javascript-with-structuredclone.md",
  slug: "deep-clones-javascript-structuredclone",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"multiple-datasets-with-gatsby-source-filesystem.md": {
  id: "multiple-datasets-with-gatsby-source-filesystem.md",
  slug: "multiple-datasets-with-gatsby-source-filesystem",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"must-have-sveltekit-extension-for-vs-code-sveltekit-snippets.md": {
  id: "must-have-sveltekit-extension-for-vs-code-sveltekit-snippets.md",
  slug: "must-have-sveltekit-extension-for-vs-code-sveltekit-snippets",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"my-first-week-at-auth0.md": {
  id: "my-first-week-at-auth0.md",
  slug: "my-first-week-at-auth0",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"my-terminal-has-super-powers.md": {
  id: "my-terminal-has-super-powers.md",
  slug: "my-terminal-has-super-powers",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"n+1-part-of-the-auth0-culture.md": {
  id: "n+1-part-of-the-auth0-culture.md",
  slug: "n+1-part-of-the-auth0-culture",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"new-vs-code-extension-for-testing-apis.md": {
  id: "new-vs-code-extension-for-testing-apis.md",
  slug: "new-vs-code-extension-for-testing-apis",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"next-js-10-image-component-a-first-look.md": {
  id: "next-js-10-image-component-a-first-look.md",
  slug: "next-js-10-image-component-a-first-look",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"node-and-express-for-beginners.md": {
  id: "node-and-express-for-beginners.md",
  slug: "node-and-express-for-beginners",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"open-anchor-link-in-new-tab.md": {
  id: "open-anchor-link-in-new-tab.md",
  slug: "open-anchor-link-in-new-tab",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"parse-json-request-body-in-express.md": {
  id: "parse-json-request-body-in-express.md",
  slug: "parse-json-request-body-in-express",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"react-router-in-five-minutes.md": {
  id: "react-router-in-five-minutes.md",
  slug: "react-router-in-five-minutes",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"settings-sync-extension-for-visual-studio-code.md": {
  id: "settings-sync-extension-for-visual-studio-code.md",
  slug: "settings-sync-extension-for-visual-studio-code",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"settings-sync-in-visual-studio-code.md": {
  id: "settings-sync-in-visual-studio-code.md",
  slug: "settings-sync-in-visual-studio-code",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"setup-a-custom-domain-with-netlify.md": {
  id: "setup-a-custom-domain-with-netlify.md",
  slug: "setup-a-custom-domain-with-netlify",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"supercharge-your-git-workflow-with-the-gitlens-vs-code-extension.md": {
  id: "supercharge-your-git-workflow-with-the-gitlens-vs-code-extension.md",
  slug: "supercharge-your-git-workflow-with-the-gitlens-vs-code-extension",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"the-easiest-way-to-add-node-js-user-authentication.md": {
  id: "the-easiest-way-to-add-node-js-user-authentication.md",
  slug: "the-easiest-way-to-add-node-js-user-authentication",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"the-front-matter-vs-code-extension-managing-markdown-blog-posts-with-ease.md": {
  id: "the-front-matter-vs-code-extension-managing-markdown-blog-posts-with-ease.md",
  slug: "front-matter-code-extension",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"top-5-pieces-of-advice-for-aspiring-and-learning-developers.md": {
  id: "top-5-pieces-of-advice-for-aspiring-and-learning-developers.md",
  slug: "top-5-pieces-of-advice-for-aspiring-and-learning-developers",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"top-5-struggles-of-a-developer-advocate.md": {
  id: "top-5-struggles-of-a-developer-advocate.md",
  slug: "top-5-struggles-of-a-developer-advocate",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"twilio-node-text-message.md": {
  id: "twilio-node-text-message.md",
  slug: "twilio-node-text-message",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"typescript-and-databases---keep-your-types-in-sync-with-xata.md": {
  id: "typescript-and-databases---keep-your-types-in-sync-with-xata.md",
  slug: "typescript-databases-types-sync-xata",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"using-node-watch-instead-of-nodemon.md": {
  id: "using-node-watch-instead-of-nodemon.md",
  slug: "using-node-watch-instead-of-nodemon",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"visual-studio-code-browser-preview-extension.md": {
  id: "visual-studio-code-browser-preview-extension.md",
  slug: "visual-studio-code-browser-preview-extension",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"vs-code-react-setup-5-tips.md": {
  id: "vs-code-react-setup-5-tips.md",
  slug: "vs-code-react-setup-5-tips",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"vscode-git-extensions-2020.md": {
  id: "vscode-git-extensions-2020.md",
  slug: "vscode-git-extensions-2020",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
"why-and-how-to-get-started-live-streaming.md": {
  id: "why-and-how-to-get-started-live-streaming.md",
  slug: "why-and-how-to-get-started-live-streaming",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] },
},
"course": {
"build-a-quiz-app-with-html-css-and-javascript.md": {
  id: "build-a-quiz-app-with-html-css-and-javascript.md",
  slug: "build-a-quiz-app-with-html-css-and-javascript",
  body: string,
  collection: "course",
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] },
"build-moder-websites-with-astro.md": {
  id: "build-moder-websites-with-astro.md",
  slug: "build-moder-websites-with-astro",
  body: string,
  collection: "course",
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] },
"design-and-build-a-chat-app-with-socket-io.md": {
  id: "design-and-build-a-chat-app-with-socket-io.md",
  slug: "design-and-build-a-chat-app-with-socket-io",
  body: string,
  collection: "course",
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] },
"fullstack-react-and-firebase.md": {
  id: "fullstack-react-and-firebase.md",
  slug: "fullstack-react-and-firebase",
  body: string,
  collection: "course",
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] },
"learn-visual-studio-code.md": {
  id: "learn-visual-studio-code.md",
  slug: "learn-visual-studio-code",
  body: string,
  collection: "course",
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] },
"react-and-serverless-fullstack-developmnent.md": {
  id: "react-and-serverless-fullstack-developmnent.md",
  slug: "react-and-serverless-fullstack-developmnent",
  body: string,
  collection: "course",
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] },
},
"talk": {
"all-things-open-2022.md": {
  id: "all-things-open-2022.md",
  slug: "all-things-open-2022",
  body: string,
  collection: "talk",
  data: InferEntrySchema<"talk">
} & { render(): Render[".md"] },
"render-atl-2022.md": {
  id: "render-atl-2022.md",
  slug: "render-atl-2022",
  body: string,
  collection: "talk",
  data: InferEntrySchema<"talk">
} & { render(): Render[".md"] },
"that-conference-austin-2023.md": {
  id: "that-conference-austin-2023.md",
  slug: "that-conference-austin-2023",
  body: string,
  collection: "talk",
  data: InferEntrySchema<"talk">
} & { render(): Render[".md"] },
},
"testimonial": {
"bekah.md": {
  id: "bekah.md",
  slug: "bekah",
  body: string,
  collection: "testimonial",
  data: InferEntrySchema<"testimonial">
} & { render(): Render[".md"] },
"clark.md": {
  id: "clark.md",
  slug: "clark",
  body: string,
  collection: "testimonial",
  data: InferEntrySchema<"testimonial">
} & { render(): Render[".md"] },
"zara.md": {
  id: "zara.md",
  slug: "zara",
  body: string,
  collection: "testimonial",
  data: InferEntrySchema<"testimonial">
} & { render(): Render[".md"] },
},

	};

	type ContentConfig = typeof import("../src/content/config");
}
