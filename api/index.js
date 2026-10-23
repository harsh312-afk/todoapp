const app = require('../backend/src/app');
const { connectDB } = require('../backend/src/config/db');

let dbAttempted = false;

module.exports = async (req, res) => {
  if (!dbAttempted) {
    try {
      await connectDB();
    } catch (err) {
      console.warn('[Vercel Serverless] DB connection notice:', err.message);
    } finally {
      dbAttempted = true;
    }
  }

  return app(req, res);
};
