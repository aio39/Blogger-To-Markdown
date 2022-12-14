// Generated by https://quicktype.io

export interface BlogsResponse {
  kind: string;
  id: string;
  name: string;
  description: string;
  published: Date;
  updated: Date;
  url: string;
  selfLink: string;
  posts: Pages;
  pages: Pages;
  locale: Locale;
}

export interface Locale {
  language: string;
  country: string;
  variant: string;
}

export interface Pages {
  totalItems: number;
  selfLink: string;
}

export interface PostsRequestOption {
  endDate?: Date;
  fetchBodies?: boolean;
  fetchImages?: boolean;
  labels?: string;
  maxResults?: number;
  orderBy?: 'published' | 'updated';
  pageToken?: string;
  startDate?: Date;
  status?: 'draft' | 'live' | 'scheduled' | 'all';
  view?: 'ADMIN' | 'READER' | 'AUTHOR' | 'all';
}
