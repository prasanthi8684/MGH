import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
/**
 * Downloads a remote image and saves it locally
 * @param url - Remote image URL
 * @param filename - Name to save the file as
 * @returns local file path
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const downloadImageToLocal = async (url, filename) => {
  const localPath = path.join(__dirname, 'temp', filename);

  const response = await axios.get(url, { responseType: 'stream' });

  // Ensure 'temp' directory exists
  fs.mkdirSync(path.dirname(localPath), { recursive: true });

  const writer = fs.createWriteStream(localPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(localPath));
    writer.on('error', reject);
  });
};
