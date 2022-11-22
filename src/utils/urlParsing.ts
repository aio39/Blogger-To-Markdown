const urlParsing = (url: string) => {
  const regex = /https:\/\/[\w.]*\/(\d*)\/(\d*)\/(.*)\.html/;
  const result = url.match(regex);

  if (!result || result.length <= 3) throw new Error('url is not valid');

  return {
    year: result[1],
    month: result[2],
    title: result[3],
  };
};
