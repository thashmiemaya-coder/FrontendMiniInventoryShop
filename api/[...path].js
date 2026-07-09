const BACKEND_ORIGIN = 'http://grocery-inventory-api-env.eba-wmtbxibb.eu-north-1.elasticbeanstalk.com';

export default async function handler(req, res) {
  const target = `${BACKEND_ORIGIN}${req.url}`;

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  delete headers['content-length'];

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const response = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? JSON.stringify(req.body) : undefined,
  });

  const data = await response.text();

  response.headers.forEach((value, key) => {
    if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });
  res.status(response.status).send(data);
}
