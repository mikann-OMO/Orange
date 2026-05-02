import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const postsCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/posts",
	}),
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().default(""),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});

const exhibitionCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{yaml,yml,json,md,mdx}",
		base: "./src/content/exhibition",
	}),
	schema: z.object({
		title: z.string(),
		date: z.date(),
		dir: z.string(),
		description: z.string().optional().default(""),
		cover: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		location: z.string().optional().default(""),
		featured: z.boolean().optional().default(false),
		order: z.number().optional().default(0),
		images: z
			.array(
				z.object({
					file: z.string(),
					title: z.string().optional().default(""),
					desc: z.string().optional().default(""),
				}),
			)
			.optional()
			.default([]),
	}),
});

const notesCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/notes",
	}),
	schema: z.object({
		title: z.string().nullable().optional().default(null),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		lang: z.string().optional().default(""),
		image: z.string().optional().default(""),
	}),
});

const aboutCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/about",
	}),
	schema: z.object({
		title: z.string(),
		description: z.string().optional().default(""),
		draft: z.boolean().optional().default(false),
	}),
});

const friendsCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/friends",
	}),
	schema: z.object({
		title: z.string(),
		siteurl: z.string().regex(/https?:\/\/[^\s]+/),
		desc: z.string().optional().default(""),
		image: z.union([z.string().regex(/https?:\/\/[^\s]+/), z.string().startsWith("/")]),
		rss: z.string().regex(/https?:\/\/[^\s]+/).optional(),
	}),
});

export const collections: {
	posts: typeof postsCollection;
	exhibition: typeof exhibitionCollection;
	notes: typeof notesCollection;
	about: typeof aboutCollection;
	friends: typeof friendsCollection;
} = {
	posts: postsCollection,
	exhibition: exhibitionCollection,
	notes: notesCollection,
	about: aboutCollection,
	friends: friendsCollection,
};
