const mongoose = require('mongoose');
const env = require('./env');

mongoose.set('strictQuery', true);

async function connectDatabase(uri = env.mongodbUri) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    autoIndex: true,
  });
  return mongoose.connection;
}

function dbState() {
  // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectDatabase, dbState, mongoose };
