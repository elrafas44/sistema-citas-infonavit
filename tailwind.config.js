/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        infonavit: {
          rojo: '#8A1538',  
          dorado: '#B38E5D', 
          gris: '#545454'    
        }
      }
    },
  },
  plugins: [],
};