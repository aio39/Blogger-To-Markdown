import { promises as fs } from 'fs';

const downloadImage = async (url: string, path: string) => {
  const response = await fetch(url).catch((err) => {
    console.error('Fetch Error', err, url, path);
    throw err;
  });
  if (!response) return null;
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(path, buffer).catch((err) => {
    console.error('Write Error', err, url, path);
    throw err;
  });
  return url + '' + path;
};

export default downloadImage;
