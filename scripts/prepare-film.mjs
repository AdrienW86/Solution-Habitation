import { spawnSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import path from 'node:path';

// The master stays outside Git. Usage: node scripts/prepare-film.mjs <master.mp4>
const input = process.argv[2];
if (!input) throw new Error('Indiquez le chemin du master MP4 existant.');
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const directory = path.resolve('public/media');
mkdirSync(directory, { recursive: true });
const base = path.join(directory, 'solution-habitation-motion-design');
const run = (args) => {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-y', ...args], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`FFmpeg : code ${result.status}`);
};
for (const [suffix, filter, rate, buffer] of [
  ['', [], '5M', '10M'],
  ['-720p', ['-vf', 'scale=1280:-2'], '2500k', '5M'],
]) {
  run([
    '-i',
    input,
    '-map',
    '0:v:0',
    '-map',
    '0:a?',
    ...filter,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '20',
    '-maxrate',
    rate,
    '-bufsize',
    buffer,
    '-pix_fmt',
    'yuv420p',
    '-profile:v',
    'high',
    '-level:v',
    '4.1',
    '-refs',
    '4',
    '-c:a',
    'aac',
    '-b:a',
    '160k',
    '-movflags',
    '+faststart',
    `${base}${suffix}.mp4`,
  ]);
  console.log(
    `${suffix || '1080p'} : ${(statSync(`${base}${suffix}.mp4`).size / 1e6).toFixed(2)} Mo`,
  );
}
run([
  '-ss',
  '12',
  '-i',
  input,
  '-frames:v',
  '1',
  '-vf',
  'scale=1280:-2',
  '-c:v',
  'libwebp',
  '-quality',
  '85',
  `${base}.webp`,
]);
