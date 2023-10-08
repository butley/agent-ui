/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkslategray: "#1b3358",
        white: "#fff",
        black: "#000",
        dimgray: "#525252",
        lightsalmon: "rgba(241, 145, 109, 0.2)",
        gray: "#1c1c1c",
        lavender: "#f0edff",
      },
      spacing: {},
      fontFamily: {
        poppins: "Poppins",
      },
      borderRadius: {
        "mid-7": "17.7px",
      },
      // For light theme as before
      backgroundColor: {
        'primary': '#F5D7DB',
        'secondary': '#F1916D',
        'accent': '#06162E'
      },
      textColor: {
        'primary': '#06142E',
        'secondary': '#1B3358',
      },
      // For dark theme
      dark: {
        backgroundColor: {
          'primary': '#06142E',
          'secondary': '#1B3358',
          'accent': '#F1916D'
        },
        textColor: {
          'primary': '#F5D7DB',
          'secondary': '#F1916D',
        },
      }
    },
    fontSize: {
      "mid-7": "17.7px",
      "sm-3": "13.3px",
      inherit: "inherit",
    },
  },
  variants: {
    extend: {
      visibility: ['group-hover'],
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
