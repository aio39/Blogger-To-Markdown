import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  blogID: process.env.BLOG_ID as string,
  apiKey: process.env.GCP_API_KEY as string,
  dist: '/result',
  maxFetchPosts: Infinity,
  fetchConcurrencyLimit: 20,
  fetchRetryLimit: 5,
};

export default config;
