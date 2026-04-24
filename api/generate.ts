export default async function handler(req, res) {
  try {
    const response = await fetch('https://seifataa-mcq-generator.hf.space/generate_mcqs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      },
      body: req.body, // keep FormData
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}