import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { default: app } = await import('./app');
    // Using Express app directly as a handler function for Vercel
    return app(req, res);
  } catch (error: any) {
    res.status(500).json({ 
      error: "Initialization failed", 
      message: error.message,
      stack: error.stack
    });
  }
}
