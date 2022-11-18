import { chromium } from 'playwright';

const blogURL =
  'https://aio392.blogspot.com/2019/03/MM2019Guide.htmlhttps://aio392.blogspot.com/2019/03/MM2019Guide.html';

const bodyClass = 'post-body';

console.log('start!');

(async () => {
  const browser = await chromium.launch(); // Or 'firefox' or 'webkit'.
  const page = await browser.newPage();
  await page.goto(blogURL);
  // other actions...
  const result = await page.innerHTML(`div`);
  const result2 = await page.innerHTML(`.${bodyClass}`);

  console.log(result, result2);

  console.log('end');
  await browser.close();
})();
