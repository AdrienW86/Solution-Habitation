import sharp from 'sharp';
import { createHash } from 'node:crypto';
export async function mediaFingerprint(bytes: Buffer) {
  const pixels = await sharp(bytes)
    .resize(64, 64, { fit: 'contain', background: '#ffffff' })
    .flatten({ background: '#ffffff' })
    .greyscale()
    .raw()
    .toBuffer();
  const small = await sharp(pixels, { raw: { width: 64, height: 64, channels: 1 } })
    .resize(9, 8, { fit: 'fill' })
    .greyscale()
    .raw()
    .toBuffer();
  let hash = 0n;
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++)
      hash = (hash << 1n) | (small[y * 9 + x] > small[y * 9 + x + 1] ? 1n : 0n);
  return {
    byteHash: createHash('sha256').update(bytes).digest('hex'),
    pixelHash: createHash('sha256').update(pixels).digest('hex'),
    differenceHash: hash.toString(16).padStart(16, '0'),
  };
}
export function imageDistance(a: string, b: string) {
  let value = BigInt(`0x${a}`) ^ BigInt(`0x${b}`),
    count = 0;
  while (value) {
    count++;
    value &= value - 1n;
  }
  return count;
}
