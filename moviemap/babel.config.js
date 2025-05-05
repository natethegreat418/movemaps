export default {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  // Explicitly configure plugins but exclude react-refresh/babel
  // to prevent duplicate loading with Vite
  plugins: []
}