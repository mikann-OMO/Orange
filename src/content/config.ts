import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
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

const albumsCollection = defineCollection({
	type: "data",
	schema: z.object({
		title: z.string(),
		date: z.date(),
		dir: z.string(), // 对应 public/images 下的相册目录名
		description: z.string().optional().default(""),
		cover: z.string().optional().default(""), // 可选：自定义封面
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
	schema: z.object({
		title: z.string(),
		description: z.string().optional().default(""),
		draft: z.boolean().optional().default(false),
	}),
});

const friendsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		siteurl: z.string().url(),
		desc: z.string().optional().default(""),
		image: z.string().url(),
		rss: z.string().url().optional(),
	}),
});

export const collections: Record<
	string,
	ReturnType<typeof defineCollection>
> = {
	posts: postsCollection,
	albums: albumsCollection,
	notes: notesCollection,
	about: aboutCollection,
	friends: friendsCollection,
} satisfies Record<string, ReturnType<typeof defineCollection>>;
