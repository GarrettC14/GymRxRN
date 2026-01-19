/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Match iOS app color scheme
        background: {
          DEFAULT: '#0A0A0A',
          accent: '#1A1A1A',
        },
        primary: {
          DEFAULT: '#007AFF',
          light: '#5AC8FA',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8E8E93',
        },
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
      },
    },
  },
  plugins: [],
};
