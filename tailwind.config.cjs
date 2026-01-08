/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  // 优化内容配置，减少不必要的文件扫描
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}',
    './public/**/*.html'
  ],
  // 启用 JIT 模式，只生成实际使用的 CSS
  mode: 'jit',
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Roboto', 
          'sans-serif', 
          ...defaultTheme.fontFamily.sans
        ],
      },
      // 添加自定义主题颜色和间距，提高样式一致性
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
      },
      animation: {
        // 优化动画性能，减少不必要的动画
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  // 优化插件配置
  plugins: [
    require('@tailwindcss/typography')({
      // 优化排版插件配置
      className: 'prose',
      defaultVariants: {
        prose: {
          dark: true,
        },
      },
    }),
  ],
  // 配置核心插件，禁用不使用的插件以减少文件大小
  corePlugins: {
    // 根据实际使用情况调整，禁用不使用的插件
    // 例如：如果不使用 gradients，可以禁用
    // gradientColorStops: false,
  },
  // 配置安全列表，确保动态生成的类名被正确生成
  safelist: [
    // 添加常用的动态类名
    'bg-primary',
    'text-primary',
    'border-primary',
    'bg-secondary',
    'text-secondary',
    'border-secondary',
    // 用于暗黑模式的类名
    'dark:bg-primary',
    'dark:text-primary',
    'dark:border-primary',
    // 动画类名
    'animate-fade-in',
    'animate-slide-up',
  ],
}
