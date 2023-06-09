import { NextApiRequest, NextApiResponse } from 'next';

const API_KEY = process.env.GOOGLE_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=${API_KEY}`;

export default async function generateMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(URL, {
      method: 'POST',
      body: JSON.stringify(req.body)
    });
    const json = await response.json();
    res.status(200).json(json);
  } catch (error) {
    const { message, response } = error;
    res.status(response?.status || 500).json({ message });
  }
}
