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

  const toBeDownloaded = [] as [string, string, string, string][];

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
        /\[!\[\]\((https?:\/\/[^\/]*\/[^\/]*\/[^\/]*\/[^\/]*\/[^\/]*)\/([\w\d]*)\/([^\/\)]*)\)\]\([^)]*\)/g,
        (v) => {
          let [_, fileRoot, fileSize, fileName] = v.match(
            /\[!\[\]\((https?:\/\/[^\/]*\/[^\/]*\/[^\/]*\/[^\/]*\/[^\/]*)\/([\w\d]*)\/([^\/\)]*)\)\]\([^)]*\)/
          ) as [string, string, string, string];
          let fileURL = `${fileRoot}/${fileSize}/${fileName}`;

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

          const curImageIndex = imageIndexCount.toLocaleString('en-US', {
            minimumIntegerDigits: 3,
          });
          if (fileSize !== 's1600')
            fileURL = fileURL.replace(/\/s\d{1,2}00\//g, '/s1600/');
          if (imageIndexCount == 0)
            thumbnailImage = curImageIndex + '_' + fileName;
          toBeDownloaded.push([fileURL, fileName, path, curImageIndex]);
          imageIndexCount++;

          return `![${fileName}](./${curImageIndex}_${fileName})`;
        }
      )
      .replaceAll(/^#/gm, ''); // ## -> # , ### -> ##

    // number to 4 digits

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
      Buffer.from(
        mdMetadata +
          '\n' +
          replacedMdContent.substring(
            replacedMdContent.indexOf('\n') + 2,
            replacedMdContent.length
          ) // remove first line
      )
    );

    await fs.writeFile(path + 'index.mdx', file);
  }

  downloadImageList(toBeDownloaded);
})();
