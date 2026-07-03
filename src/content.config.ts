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

		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});

const notesCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/bits",
	}),
	schema: z.object({
		title: z.string().nullable().optional().default(null),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		lang: z.string().optional().default(""),
		image: z.string().optional().default(""),
		description: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().default(""),
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
	notes: typeof notesCollection;
	about: typeof aboutCollection;
	friends: typeof friendsCollection;
} = {
	posts: postsCollection,
	notes: notesCollection,
	about: aboutCollection,
	friends: friendsCollection,
};
