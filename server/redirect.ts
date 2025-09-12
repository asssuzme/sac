import express from 'express';

// Simple redirect server to handle Supabase OAuth callbacks on port 3000
const app = express();

// Redirect all requests from port 3000 to port 5000
app.get('*', (req, res) => {
  const redirectUrl = `http://localhost:5000${req.originalUrl}`;
  console.log(`Redirecting from :3000${req.originalUrl} to ${redirectUrl}`);
  res.redirect(redirectUrl);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Redirect server running on port ${PORT}, forwarding to port 5000`);
});