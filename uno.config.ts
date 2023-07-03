import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      link: 'font-medium text-gray-900 no-underline',
    },
  ],
  rules: [],
  theme: {
    colors: {
      bg: 'var(--color-background)',
    },
  },
  presets: [
    presetUno({
      dark: 'media',
    }),
    presetAttributify(),
  ],
})
