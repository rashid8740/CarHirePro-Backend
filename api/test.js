// Minimal test function to verify Vercel deployment works
export default function handler(req, res) {
  res.json({
    message: 'Test function works!',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
}

