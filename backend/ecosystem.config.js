module.exports = {
  apps: [{
    name: 'resourceflow-backend',
    script: './src/server.js',
    instances: 1, // Use 1 for Windows, 'max' for Linux
    exec_mode: 'fork', // Use 'fork' for Windows, 'cluster' for Linux
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};