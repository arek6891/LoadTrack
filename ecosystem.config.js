module.exports = {
  apps: [
    {
      name: 'loadtrack-server',
      script: 'dist/index.js',
      cwd: '/opt/LoadTrack/server',
      env: {
        NODE_ENV: 'production',
        PORT: 3601
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
