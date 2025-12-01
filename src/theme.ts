import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: {
          50: { value: '#e6f3ff' },
          100: { value: '#b3d9ff' },
          200: { value: '#80bfff' },
          300: { value: '#4da5ff' },
          400: { value: '#1a8bff' },
          500: { value: '#0071e6' },
          600: { value: '#0059b3' },
          700: { value: '#004080' },
          800: { value: '#00284d' },
          900: { value: '#00101a' },
        },
      },
    },
    semanticTokens: {
      colors: {
        'bg.subtle': {
          value: { base: '{colors.gray.50}', _dark: '{colors.gray.900}' },
        },
        'bg.header': {
          value: { base: '{colors.white}', _dark: '{colors.gray.800}' },
        },
        'bg.main': {
          value: { base: '{colors.white}', _dark: '{colors.gray.900}' },
        },
        'text.primary': {
          value: { base: '{colors.gray.900}', _dark: '{colors.gray.50}' },
        },
        'text.secondary': {
          value: { base: '{colors.gray.600}', _dark: '{colors.gray.400}' },
        },
        'text.fg': {
          value: { base: '{colors.gray.900}', _dark: '{colors.gray.50}' },
        },
        'text.fg.muted': {
          value: { base: '{colors.gray.600}', _dark: '{colors.gray.400}' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);

