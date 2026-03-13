const { createClient } = require('redis');
 
let client = null;
 
async function getClient() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.error('Redis error:', err));
    await client.connect();
  }
  return client;
}
 
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
 
  try {
    const redis = await getClient();
    const { key } = req.query;
 
    if (!key) return res.status(400).json({ error: 'Missing key' });
 
    if (req.method === 'GET') {
      const val = await redis.get('arx:' + key);
      return res.status(200).json({ value: val ? JSON.parse(val) : null });
    }
 
    if (req.method === 'POST') {
      const { value } = req.body;
      await redis.set('arx:' + key, JSON.stringify(value));
      return res.status(200).json({ ok: true });
    }
 
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
};
 
