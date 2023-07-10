import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      link: 'font-medium text-gray-900 no-underline',
      sidebar: 'flex-[0_0_200px] p-3',
      toolbar: 'flex-[0_0_44px] flex items-center px-3 justify-between',
      workspace: 'flex-auto bg-[#f1f1f1] relative',
      'inner-shadow':
        'absolute inset-0 shadow-[inset_0_0_10px_0_rgba(0,0,0,0.1)] pointer-events-none',
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
