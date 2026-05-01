const isProd = process.env.NODE_ENV === "production";

export default {
	plugins: {
		"postcss-import": {},
		"tailwindcss/nesting": {},
		tailwindcss: {},
		...(isProd && {
			cssnano: {
				preset: [
					"advanced",
					{
						discardComments: { removeAll: true },
						normalizeWhitespace: true,
						colormin: true,
						convertValues: true,
						mergeRules: true,
						minifyFontValues: true,
						minifyGradients: true,
						minifyParams: true,
						minifySelectors: true,
						normalizeString: true,
						normalizeUrl: true,
						orderedValues: true,
						reduceIdents: true,
						reduceInitial: true,
						reduceTransforms: true,
						svgo: true,
						uniqueSelectors: true,
					},
				],
			},
		}),
	},
};
