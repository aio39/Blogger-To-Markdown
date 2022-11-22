import { NodeHtmlMarkdown } from 'node-html-markdown';
import * as fs from 'node:fs/promises';
import config from './config';
import { downloadImageList } from './task/downloadImageList';
import generateMdMetadata from './utils/generateMdMetadata';
import limitFileName from './utils/limitFileName';
import { requestPosts } from './utils/requestAPI';

(async () => {
  const result = await requestPosts(config.blogID, config.apiKey, {
    maxResults: config.fetchConcurrencyLimit,
  });
  // result.forEach((item, i) => {
  //   console.log(i + '.' + item.title);
  // });
  const toBeDownloaded = [] as [string, string, string, number][];

  for await (const post of result) {
    let { content, published, title, author, labels } = post;
    const md =
      generateMdMetadata({
        title,
        author: author.displayName,
        category: labels?.[0] ?? 'default',
        date: published,
        tags: labels,
        keywords: labels,
        draft: false,
        private: false,
      }) +
      '\n' +
      NodeHtmlMarkdown.translate(content);
    const date = new Date(published);
    title = title.replaceAll('/', '-');

    const path = `./result/${date.getFullYear()}/${date.getMonth()} ${title}/`; // NOTE 끝에 /　붙여야함
    await fs.mkdir(path, { recursive: true });

    let imageIndexCount = 0;

    const newMd = md.replaceAll(
      /https?:\/\/[^\/]*\/[^\/]*\/[^\/]*\/[^\/]*\/[^\/]*\/([\w\d]*)\/([^\/)]*)/g,
      (v) => {
        let [fileURL, fileSize, fileName] = v.match(
          /https?:\/\/[^\/]*\/[^\/]*\/[^\/]*\/[^\/]*\/[^\/]*\/([\w\d]*)\/([^\/]*)/
        ) as [string, string, string];

        let isImage = false;
        for (let exec of [
          'jpg',
          'png',
          'gif',
          'jpeg',
          'webp',
          'JPG',
          'PNG',
          'JPEG',
          'GIF',
          'WEBP',
        ]) {
          if (fileName.endsWith(exec)) {
            isImage = true;
            fileName = limitFileName(fileName);
            break;
          }
        }
        if (!isImage) return fileURL;

        const curImageIndex = imageIndexCount;
        if (fileURL.startsWith('https')) {
          if (fileSize !== 's1600') {
            fileURL = fileURL.replace(/\/s\d{1,2}00\//g, '/s1600/');
          }
          toBeDownloaded.push([fileURL, fileName, path, curImageIndex]);
        } else {
          imageIndexCount++;
        }

        return curImageIndex.toString() + '_' + fileName;
      }
    );

    const file = new Uint8Array(Buffer.from(newMd));
    await fs.writeFile(path + 'index.md', file);
  }
  // array to file

  await fs.writeFile('./my.json', toBeDownloaded.join(', \n') + '\n');
  downloadImageList(toBeDownloaded);
})();
