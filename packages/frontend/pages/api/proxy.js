// Proxy all API requests to the backend
export default async function handler(req, res) {
  const { path } = req.query
  const apiPath = Array.isArray(path) ? path.join('/') : path

  // Use Render backend URL
  const backendUrl = 'https://safecart-backend-j3ry.onrender.com/api/' + apiPath

  try {
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Proxy error' })
  }
}
