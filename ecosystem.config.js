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
      max_memory_restart: '500M'
    },
    {
      name: 'loadtrack-client',
      script: '/home/asobczyk/.local/bin/serve',
      args: '-s dist -l 3602',
      cwd: '/opt/LoadTrack/client',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M'
    }
  ]
};
