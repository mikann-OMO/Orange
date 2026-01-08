import postcssImport from 'postcss-import'
import postcssNesting from 'tailwindcss/nesting'
import tailwindcss from 'tailwindcss'

// Use process.env.NODE_ENV for environment-specific configuration
const isProduction = process.env.NODE_ENV === 'production'

export default {
  plugins: {
    'postcss-import': postcssImport,
    'tailwindcss/nesting': postcssNesting,
    tailwindcss: tailwindcss,
    ...(isProduction ? {
      // Add cssnano for production minification
      cssnano: {
        preset: 'default',
      },
    } : {}),
  },
}
