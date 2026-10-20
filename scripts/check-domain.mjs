import { request } from 'node:http';
const base = 'http://127.0.0.1:3000';
for (const path of ['/couverture/reparation/perpignan', '/expertises/toiture', '/mentions']) {
  const response = await new Promise((resolve, reject) => {
    const req = request(base + path, { headers: { Host: 'www.solution-habitation.fr' } }, (res) => {
      res.resume();
      resolve({ status: res.statusCode, destination: res.headers.location });
    });
    req.on('error', reject);
    req.end();
  });
  const destination = response.destination;
  const expected = path.startsWith('/couverture')
    ? 'https://solution-habitation.fr/expertises/toiture#reparation-infiltrations'
    : path === '/mentions'
      ? 'https://solution-habitation.fr/informations'
      : 'https://solution-habitation.fr/expertises/toiture';
  if (response.status !== 301 || destination !== expected)
    throw new Error(JSON.stringify({ path, status: response.status, destination, expected }));
  console.log(JSON.stringify({ path, status: response.status, destination }));
}
