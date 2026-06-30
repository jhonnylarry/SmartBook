/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta institucional Colegio Bernardo O'Higgins — navy profundo
        primary: {
          50:  '#eff4ff',
          100: '#dbe8ff',
          200: '#bfd4ff',
          300: '#93b5fd',
          400: '#6090fa',
          500: '#3b6ef6',
          600: '#2547A0',
          700: '#1E3A8A',
          800: '#172e72',
          900: '#13294B',
          950: '#0d1b33',
        },
        // Ámbar/dorado institucional
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Éxito
        success: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        // Superficie
        surface: '#F6F8FC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card':      '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover':'0 8px 24px -4px rgb(0 0 0 / 0.12), 0 4px 8px -2px rgb(0 0 0 / 0.08)',
        'glass':     '0 8px 40px rgba(2, 6, 23, 0.12)',
        'glass-lg':  '0 20px 60px rgba(2, 6, 23, 0.18)',
        'glow':      '0 0 20px rgba(37, 71, 160, 0.35)',
        'glow-accent':'0 0 20px rgba(245, 158, 11, 0.40)',
        'inner-glow':'inset 0 1px 0 rgba(255,255,255,0.15)',
        'nav-active':'inset 3px 0 0 #F59E0B',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        '2xl': '40px',
      },
      keyframes: {
        // Shimmer para skeletons
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Float para FAB
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        // Entrada suave hacia arriba
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Escala con rebote
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '60%':  { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Entrada desde la derecha
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Entrada desde la derecha con salida
        slideInRightFull: {
          '0%':   { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // Dropdown slide hacia abajo
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        // Pulse con glow para FAB
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(245, 158, 11, 0)' },
        },
        // Ripple para botones
        ripple: {
          '0%':   { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        // Aurora de fondo para login
        aurora: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)', opacity: '0.6' },
          '33%':      { transform: 'translate(5%, -8%) scale(1.05)', opacity: '0.8' },
          '66%':      { transform: 'translate(-4%, 4%) scale(0.98)', opacity: '0.5' },
        },
        // Count-up visual (fade in rápido)
        countUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Fade in simple
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Fade in para backdrop
        fadeInBackdrop: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Barra de progreso
        progressBar: {
          '0%':   { width: '100%' },
          '100%': { width: '0%' },
        },
        // Stagger para filas de tabla (se aplica con delay vía style)
        rowIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'shimmer':          'shimmer 2s linear infinite',
        'float':            'float 3s ease-in-out infinite',
        'fadeInUp':         'fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scaleIn':          'scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slideInRight':     'slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slideDown':        'slideDown 0.2s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulseGlow':        'pulseGlow 2s ease-in-out infinite',
        'aurora':           'aurora 8s ease-in-out infinite',
        'countUp':          'countUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fadeIn':           'fadeIn 0.2s ease-out both',
        'progressBar':      'progressBar linear forwards',
        'rowIn':            'rowIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
