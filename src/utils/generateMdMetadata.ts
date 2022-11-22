interface Params {
  title: string;
  //   slug: string;
  category: string;
  author: string;
  tags?: string[];
  keywords?: string[];
  date: string;
  draft: boolean;
  thumbnail: string;
  private: boolean;
}

import dayjs from 'dayjs';

const generateMdMetadata = ({
  title,
  //   slug,
  category,
  author,
  tags,
  keywords,
  date,
  draft,
  thumbnail,
  private: aPrivate,
}: Params) => {
  const aDay = dayjs(date);

  const string = `---
title: ${title}
slug: '${aDay.unix()}'
category: ${category}
author: ${author}
tags: [${tags?.reduce((acc, cur) => acc + `'#${cur}',`, '').slice(0, -1)}]
keywords: [${keywords
    ?.reduce((acc, cur) => acc + `'${cur}',`, '')
    .slice(0, -1)}]
date: ${aDay.format('YYYY-MM-DD')}
thumbnail: ${thumbnail}
draft: ${draft ? 'true' : 'false'} 
private: ${aPrivate ? 'true' : 'false'}
---`;

  return string;
};

export default generateMdMetadata;
