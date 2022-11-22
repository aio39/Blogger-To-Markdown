interface Params {
  title: string;
  //   slug: string;
  category: string;
  author: string;
  tags?: string[];
  keywords?: string[];
  date: string;
  draft: boolean;
  private: boolean;
}

const generateMdMetadata = ({
  title,
  //   slug,
  category,
  author,
  tags,
  keywords,
  date,
  draft,
  private: aPrivate,
}: Params) => {
  const aDate = new Date(date);

  const string = `---
title: ${title}
slug: ${Math.floor(aDate.getTime() / 1000)}
category: ${category}
author: ${author}
tags: [${tags?.reduce((acc, cur) => acc + `'#${cur}',`, '').slice(0, -1)}]
keywords: [${keywords
    ?.reduce((acc, cur) => acc + `'${cur}',`, '')
    .slice(0, -1)}]
date: ${aDate.getFullYear()}-${aDate.getMonth()}-${aDate.getDay()}
thumbnail: image.png
draft: ${draft ? 'true' : 'false'} 
private: ${aPrivate ? 'true' : 'false'}
---`;

  return string;
};

export default generateMdMetadata;
