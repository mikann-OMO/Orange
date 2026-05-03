const isProd = process.env.NODE_ENV === "production";

export default {
	plugins: {
		"postcss-import": {},
		"tailwindcss/nesting": {},
		tailwindcss: {},
		...(isProd && {
			cssnano: {
				preset: [
					"default",
					{
						discardComments: { removeAll: true },
					},
				],
			},
		}),
	},
};
