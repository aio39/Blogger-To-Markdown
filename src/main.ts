import dayjs from 'dayjs';
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

  const toBeDownloaded = [] as [string, string, string, number][];

  for await (const post of result) {
    let { content, published, title, author, labels } = post;
    const mdContent = NodeHtmlMarkdown.translate(content);
    const publishedDay = dayjs(published);
    title = title.replaceAll('/', '-');

    const path = `.${config.dist}/${publishedDay.format(
      'YYYY'
    )}/${publishedDay.format('MM')} ${title}/`; // NOTE 끝에 /　붙여야함
    await fs.mkdir(path, { recursive: true });

    let imageIndexCount = 0;
    let thumbnailImage = 'image.png';

    const replacedMdContent = mdContent
      .replaceAll(
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
            if (fileSize !== 's1600')
              fileURL = fileURL.replace(/\/s\d{1,2}00\//g, '/s1600/');
            if (imageIndexCount == 0) thumbnailImage = fileName;
            toBeDownloaded.push([fileURL, fileName, path, curImageIndex]);
          } else {
            imageIndexCount++;
          }

          return curImageIndex.toString() + '_' + fileName;
        }
      )
      .replaceAll(/^#/gm, ''); // ## -> # , ### -> ##

    const mdMetadata = generateMdMetadata({
      title,
      author: author.displayName,
      category: labels?.[0] ?? 'default',
      date: published,
      tags: labels,
      keywords: labels,
      draft: false,
      thumbnail: thumbnailImage,
      private: false,
    });

    const file = new Uint8Array(
      Buffer.from(mdMetadata + '\n' + replacedMdContent)
    );
    await fs.writeFile(path + 'index.md', file);
  }

  downloadImageList(toBeDownloaded);
})();
