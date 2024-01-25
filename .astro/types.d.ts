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

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

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
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"10-amazing-vs-code-themes-youve-probably-never-heard-of.md": {
	id: "10-amazing-vs-code-themes-youve-probably-never-heard-of.md";
  slug: "10-amazing-vs-code-themes-youve-probably-never-heard-of";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"10-examples-with-css-grid.md": {
	id: "10-examples-with-css-grid.md";
  slug: "10-examples-with-css-grid";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"100k-subscribers-on-youtube-5-things-i-learned.md": {
	id: "100k-subscribers-on-youtube-5-things-i-learned.md";
  slug: "100k-subscribers-on-youtube-5-things-i-learned";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"15-common-beginner-javascript-mistakes.md": {
	id: "15-common-beginner-javascript-mistakes.md";
  slug: "15-common-beginner-javascript-mistakes";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023-04-04-3-regrets-from-my-computer-science-degree.md": {
	id: "2023-04-04-3-regrets-from-my-computer-science-degree.md";
  slug: "3-regrets-computer-science-degree";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023-04-19-use-ai-to-create-bash-scripts-using-fig.md": {
	id: "2023-04-19-use-ai-to-create-bash-scripts-using-fig.md";
  slug: "ai-create-bash-scripts-fig";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023-04-21-is-create-react-app-really-dead.md": {
	id: "2023-04-21-is-create-react-app-really-dead.md";
  slug: "create-react-app-dead";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023-04-21-tips-for-handling-and-tracking-errors-in-javascript.md": {
	id: "2023-04-21-tips-for-handling-and-tracking-errors-in-javascript.md";
  slug: "tips-handling-tracking-errors-javascript";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023-05-04-5-reasons-developers-regret-their-jobs.md": {
	id: "2023-05-04-5-reasons-developers-regret-their-jobs.md";
  slug: "5-reasons-developers-regret-jobs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023-05-04-how-to-add-openai-to-your-nextjs-project.md": {
	id: "2023-05-04-how-to-add-openai-to-your-nextjs-project.md";
  slug: "add-openai-nextjs-project";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023-06-20-5-utility-apps-i-use-every-day-(for-mac).md": {
	id: "2023-06-20-5-utility-apps-i-use-every-day-(for-mac).md";
  slug: "5-utility-apps-mac";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023-08-10-10-best-video-platforms-for-learning-web-development.md": {
	id: "2023-08-10-10-best-video-platforms-for-learning-web-development.md";
  slug: "10-video-platforms-learning-web-development";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023-09-14-the-postman-vs-code-extension-is-finally-here!.md": {
	id: "2023-09-14-the-postman-vs-code-extension-is-finally-here!.md";
  slug: "postman-vs-code-extension";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"5-things-i-ve-learned-from-creating-youtube-videos.md": {
	id: "5-things-i-ve-learned-from-creating-youtube-videos.md";
  slug: "5-things-i-ve-learned-from-creating-youtube-videos";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"5-tips-for-crushing-developer-interviews.md": {
	id: "5-tips-for-crushing-developer-interviews.md";
  slug: "5-tips-for-crushing-developer-interviews";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"5-ways-i've-used-chatgpt-in-my-javascript-projects.md": {
	id: "5-ways-i've-used-chatgpt-in-my-javascript-projects.md";
  slug: "5-ways-chatgpt-javascript-projects";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"5-ways-to-customize-vs-code.md": {
	id: "5-ways-to-customize-vs-code.md";
  slug: "5-ways-to-customize-vs-code";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"add-vs-code-to-your-path.md": {
	id: "add-vs-code-to-your-path.md";
  slug: "add-vs-code-to-your-path";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"announcing-advent-of-javascript-a-free-series-of-javascript-challenges.md": {
	id: "announcing-advent-of-javascript-a-free-series-of-javascript-challenges.md";
  slug: "announcing-advent-of-javascript-a-free-series-of-javascript-challenges";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"appwrite-best-developer-tools-on-product-hunt-in-2022.md": {
	id: "appwrite-best-developer-tools-on-product-hunt-in-2022.md";
  slug: "appwrite-developer-tools-product-hunt-2022";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"authenticated-jamstack-app-with-next-js-airtable-auth0-and-tailwind-css.md": {
	id: "authenticated-jamstack-app-with-next-js-airtable-auth0-and-tailwind-css.md";
  slug: "authenticated-jamstack-app-with-next-js-airtable-auth0-and-tailwind-css";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"authentication-experience-from-a-developer-frank-calise.md": {
	id: "authentication-experience-from-a-developer-frank-calise.md";
  slug: "authentication-experience-from-a-developer-frank-calise";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"best-browser-for-web-developers.md": {
	id: "best-browser-for-web-developers.md";
  slug: "browser-web-developers";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"build-a-javascript-memory-match-game.md": {
	id: "build-a-javascript-memory-match-game.md";
  slug: "build-a-javascript-memory-match-game";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"build-a-javascript-search-bar.md": {
	id: "build-a-javascript-search-bar.md";
  slug: "build-a-javascript-search-bar";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"build-a-pokedex-with-vanilla-javascript-part-2.md": {
	id: "build-a-pokedex-with-vanilla-javascript-part-2.md";
  slug: "build-a-pokedex-with-vanilla-javascript-part-2";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"build-a-pokedex-with-vanilla-javascript.md": {
	id: "build-a-pokedex-with-vanilla-javascript.md";
  slug: "build-a-pokedex-with-vanilla-javascript";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"cloudinary-image-upload-with-nodejs.md": {
	id: "cloudinary-image-upload-with-nodejs.md";
  slug: "cloudinary-image-upload-with-nodejs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"configure-proxy-in-react.md": {
	id: "configure-proxy-in-react.md";
  slug: "configure-proxy-in-react";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"convert-number-from-decimal-to-hexadecimal.md": {
	id: "convert-number-from-decimal-to-hexadecimal.md";
  slug: "convert-number-from-decimal-to-hexadecimal";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io.md": {
	id: "create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io.md";
  slug: "create-a-link-shortener-app-with-sveltekit-typescript-and-directus-io";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"cs-degree-vs-programming-bootcamp-vs-self-taught.md": {
	id: "cs-degree-vs-programming-bootcamp-vs-self-taught.md";
  slug: "cs-degree-vs-programming-bootcamp-vs-self-taught";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"favorite-vs-code-font-2022.md": {
	id: "favorite-vs-code-font-2022.md";
  slug: "favorite-vs-code-font-2022";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"goals-for-2022.md": {
	id: "goals-for-2022.md";
  slug: "goals-for-2022";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"hello-world.md": {
	id: "hello-world.md";
  slug: "hello-world";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"how-i-prepare-for-conference-talks.md": {
	id: "how-i-prepare-for-conference-talks.md";
  slug: "how-i-prepare-for-conference-talks";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"how-to-create-and-publish-npm-packages.md": {
	id: "how-to-create-and-publish-npm-packages.md";
  slug: "how-to-create-and-publish-npm-packages";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"how-to-redirect-netlify-functions-to-a-simpler-path.md": {
	id: "how-to-redirect-netlify-functions-to-a-simpler-path.md";
  slug: "how-to-redirect-netlify-functions-to-a-simpler-path";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"how-to-test-npm-packages-locally.md": {
	id: "how-to-test-npm-packages-locally.md";
  slug: "how-to-test-npm-packages-locally";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"i-created-a-developer-rap-video-here-s-what-i-learned.md": {
	id: "i-created-a-developer-rap-video-here-s-what-i-learned.md";
  slug: "i-created-a-developer-rap-video-here-s-what-i-learned";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"i-created-my-first-google-chrome-extension.md": {
	id: "i-created-my-first-google-chrome-extension.md";
  slug: "i-created-my-first-google-chrome-extension";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"i-got-corrected-on-my-second-day.md": {
	id: "i-got-corrected-on-my-second-day.md";
  slug: "i-got-corrected-on-my-second-day";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"i-tried-astro.md": {
	id: "i-tried-astro.md";
  slug: "i-tried-astro";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"intro-to-jamstack-what-i-learned.md": {
	id: "intro-to-jamstack-what-i-learned.md";
  slug: "intro-to-jamstack-what-i-learned";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"javascript-array-filter-explained-in-5-minutes.md": {
	id: "javascript-array-filter-explained-in-5-minutes.md";
  slug: "javascript-array-filter-explained-in-5-minutes";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"javascript-callbacks-explained-in-5-minutes.md": {
	id: "javascript-callbacks-explained-in-5-minutes.md";
  slug: "javascript-callbacks-explained-in-5-minutes";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"javascript-trends-2023.md": {
	id: "javascript-trends-2023.md";
  slug: "javascript-trends-2023";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"make-deep-clones-in-javascript-with-structuredclone.md": {
	id: "make-deep-clones-in-javascript-with-structuredclone.md";
  slug: "deep-clones-javascript-structuredclone";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"multiple-datasets-with-gatsby-source-filesystem.md": {
	id: "multiple-datasets-with-gatsby-source-filesystem.md";
  slug: "multiple-datasets-with-gatsby-source-filesystem";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"must-have-sveltekit-extension-for-vs-code-sveltekit-snippets.md": {
	id: "must-have-sveltekit-extension-for-vs-code-sveltekit-snippets.md";
  slug: "must-have-sveltekit-extension-for-vs-code-sveltekit-snippets";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"my-first-week-at-auth0.md": {
	id: "my-first-week-at-auth0.md";
  slug: "my-first-week-at-auth0";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"my-terminal-has-super-powers.md": {
	id: "my-terminal-has-super-powers.md";
  slug: "my-terminal-has-super-powers";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"n+1-part-of-the-auth0-culture.md": {
	id: "n+1-part-of-the-auth0-culture.md";
  slug: "n+1-part-of-the-auth0-culture";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"new-vs-code-extension-for-testing-apis.md": {
	id: "new-vs-code-extension-for-testing-apis.md";
  slug: "new-vs-code-extension-for-testing-apis";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"next-js-10-image-component-a-first-look.md": {
	id: "next-js-10-image-component-a-first-look.md";
  slug: "next-js-10-image-component-a-first-look";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"node-and-express-for-beginners.md": {
	id: "node-and-express-for-beginners.md";
  slug: "node-and-express-for-beginners";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"open-anchor-link-in-new-tab.md": {
	id: "open-anchor-link-in-new-tab.md";
  slug: "open-anchor-link-in-new-tab";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"parse-json-request-body-in-express.md": {
	id: "parse-json-request-body-in-express.md";
  slug: "parse-json-request-body-in-express";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"react-router-in-five-minutes.md": {
	id: "react-router-in-five-minutes.md";
  slug: "react-router-in-five-minutes";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"settings-sync-extension-for-visual-studio-code.md": {
	id: "settings-sync-extension-for-visual-studio-code.md";
  slug: "settings-sync-extension-for-visual-studio-code";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"settings-sync-in-visual-studio-code.md": {
	id: "settings-sync-in-visual-studio-code.md";
  slug: "settings-sync-in-visual-studio-code";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"setup-a-custom-domain-with-netlify.md": {
	id: "setup-a-custom-domain-with-netlify.md";
  slug: "setup-a-custom-domain-with-netlify";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"supercharge-your-git-workflow-with-the-gitlens-vs-code-extension.md": {
	id: "supercharge-your-git-workflow-with-the-gitlens-vs-code-extension.md";
  slug: "supercharge-your-git-workflow-with-the-gitlens-vs-code-extension";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"the-easiest-way-to-add-node-js-user-authentication.md": {
	id: "the-easiest-way-to-add-node-js-user-authentication.md";
  slug: "the-easiest-way-to-add-node-js-user-authentication";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"the-front-matter-vs-code-extension-managing-markdown-blog-posts-with-ease.md": {
	id: "the-front-matter-vs-code-extension-managing-markdown-blog-posts-with-ease.md";
  slug: "front-matter-code-extension";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"top-5-pieces-of-advice-for-aspiring-and-learning-developers.md": {
	id: "top-5-pieces-of-advice-for-aspiring-and-learning-developers.md";
  slug: "top-5-pieces-of-advice-for-aspiring-and-learning-developers";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"top-5-struggles-of-a-developer-advocate.md": {
	id: "top-5-struggles-of-a-developer-advocate.md";
  slug: "top-5-struggles-of-a-developer-advocate";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"twilio-node-text-message.md": {
	id: "twilio-node-text-message.md";
  slug: "twilio-node-text-message";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"typescript-and-databases---keep-your-types-in-sync-with-xata.md": {
	id: "typescript-and-databases---keep-your-types-in-sync-with-xata.md";
  slug: "typescript-databases-types-sync-xata";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"using-node-watch-instead-of-nodemon.md": {
	id: "using-node-watch-instead-of-nodemon.md";
  slug: "using-node-watch-instead-of-nodemon";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"visual-studio-code-browser-preview-extension.md": {
	id: "visual-studio-code-browser-preview-extension.md";
  slug: "visual-studio-code-browser-preview-extension";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"vs-code-react-setup-5-tips.md": {
	id: "vs-code-react-setup-5-tips.md";
  slug: "vs-code-react-setup-5-tips";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"vscode-git-extensions-2020.md": {
	id: "vscode-git-extensions-2020.md";
  slug: "vscode-git-extensions-2020";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"why-and-how-to-get-started-live-streaming.md": {
	id: "why-and-how-to-get-started-live-streaming.md";
  slug: "why-and-how-to-get-started-live-streaming";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};
"course": {
"courses/build-a-quiz-app-with-html-css-and-javascript/build-a-quiz-app-with-html-css-and-javascript.md": {
	id: "courses/build-a-quiz-app-with-html-css-and-javascript/build-a-quiz-app-with-html-css-and-javascript.md";
  slug: "courses/build-a-quiz-app-with-html-css-and-javascript/build-a-quiz-app-with-html-css-and-javascript";
  body: string;
  collection: "course";
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] };
"courses/design-and-build-a-chat-app-with-socket-io/design-and-build-a-chat-app-with-socket-io.md": {
	id: "courses/design-and-build-a-chat-app-with-socket-io/design-and-build-a-chat-app-with-socket-io.md";
  slug: "courses/design-and-build-a-chat-app-with-socket-io/design-and-build-a-chat-app-with-socket-io";
  body: string;
  collection: "course";
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] };
"courses/fullstack-react-and-firebase/fullstack-react-and-firebase.md": {
	id: "courses/fullstack-react-and-firebase/fullstack-react-and-firebase.md";
  slug: "courses/fullstack-react-and-firebase/fullstack-react-and-firebase";
  body: string;
  collection: "course";
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] };
"courses/learn-visual-studio-code/learn-visual-studio-code.md": {
	id: "courses/learn-visual-studio-code/learn-visual-studio-code.md";
  slug: "courses/learn-visual-studio-code/learn-visual-studio-code";
  body: string;
  collection: "course";
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] };
"courses/modern-websites-with-astro/build-modern-websites-with-astro.md": {
	id: "courses/modern-websites-with-astro/build-modern-websites-with-astro.md";
  slug: "courses/modern-websites-with-astro/build-modern-websites-with-astro";
  body: string;
  collection: "course";
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] };
"courses/react-and-serverless-fullstack-developmnent/react-and-serverless-fullstack-developmnent.md": {
	id: "courses/react-and-serverless-fullstack-developmnent/react-and-serverless-fullstack-developmnent.md";
  slug: "courses/react-and-serverless-fullstack-developmnent/react-and-serverless-fullstack-developmnent";
  body: string;
  collection: "course";
  data: InferEntrySchema<"course">
} & { render(): Render[".md"] };
};
"talk": {
"all-things-open-2022.md": {
	id: "all-things-open-2022.md";
  slug: "all-things-open-2022";
  body: string;
  collection: "talk";
  data: InferEntrySchema<"talk">
} & { render(): Render[".md"] };
"all-things-open-2023.md": {
	id: "all-things-open-2023.md";
  slug: "all-things-open-2023";
  body: string;
  collection: "talk";
  data: InferEntrySchema<"talk">
} & { render(): Render[".md"] };
"jam-dev-2024.md": {
	id: "jam-dev-2024.md";
  slug: "jam-dev-2024";
  body: string;
  collection: "talk";
  data: InferEntrySchema<"talk">
} & { render(): Render[".md"] };
"render-atl-2022.md": {
	id: "render-atl-2022.md";
  slug: "render-atl-2022";
  body: string;
  collection: "talk";
  data: InferEntrySchema<"talk">
} & { render(): Render[".md"] };
"that-conference-austin-2023.md": {
	id: "that-conference-austin-2023.md";
  slug: "that-conference-austin-2023";
  body: string;
  collection: "talk";
  data: InferEntrySchema<"talk">
} & { render(): Render[".md"] };
};
"testimonial": {
"bekah.md": {
	id: "bekah.md";
  slug: "bekah";
  body: string;
  collection: "testimonial";
  data: InferEntrySchema<"testimonial">
} & { render(): Render[".md"] };
"clark.md": {
	id: "clark.md";
  slug: "clark";
  body: string;
  collection: "testimonial";
  data: InferEntrySchema<"testimonial">
} & { render(): Render[".md"] };
"zara.md": {
	id: "zara.md";
  slug: "zara";
  body: string;
  collection: "testimonial";
  data: InferEntrySchema<"testimonial">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
