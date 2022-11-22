import got from 'got';
import config from '../config';
import { PostsRequestOption } from '../types/BlogsResponse';
import { PostsResponse } from '../types/PostsResponse';

export const requestPosts = async (
  blogID: string,
  apiKey: string,
  option?: PostsRequestOption
) => {
  const url = new URL(
    `https://www.googleapis.com/blogger/v3/blogs/${blogID}/posts?key=${apiKey}`
  );
  option &&
    Object.entries(option).forEach(([key, value]) =>
      url.searchParams.append(key, value)
    );

  let results = [] as PostsResponse['items'];
  let pageCounts = 0;
  let count = 0;

  console.log(url.toString());
  console.log('requestPosts start');

  while (true && count < config.maxFetchPosts) {
    console.log(`Posts page ${pageCounts}`);
    const data = await got(url.toString(), {}).json<PostsResponse>();
    count += data.items.length;
    if (data.nextPageToken) {
      url.searchParams.set('pageToken', data.nextPageToken);
      results = results.concat(data.items);
      pageCounts++;
    } else {
      console.log('requestPosts end');
      break;
    }
  }

  return results;
};

export const requestBlog = async (blogID: string, apiKey: string) => {
  const response = await got(
    `https://www.googleapis.com/blogger/v3/blogs/${blogID}?key=${apiKey}`
  );

  return response;
};
