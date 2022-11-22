import { catchError, from, mergeMap, of, retry } from 'rxjs';
import config from '../config';
import downloadImage from '../utils/downloadImage';

type FileURL = string;
type FileName = string;
type FilePath = string;
type FilePrefixNum = number;

export function downloadImageList(
  toBeDownloaded: [FileURL, FileName, FilePath, FilePrefixNum][]
) {
  const TotalImageNum = toBeDownloaded.length;
  let downloadedImageCount = 0;

  from(toBeDownloaded)
    .pipe(
      mergeMap(([url, fileName, path, i]) => {
        return from(
          downloadImage(url, path + i.toString() + '_' + fileName)
        ).pipe(
          retry(config.fetchRetryLimit),
          catchError((err) => {
            return of('error!!!');
          })
        );
      }, config.fetchConcurrencyLimit)
    )
    .subscribe({
      next: (item) => {
        console.log(
          'image downloading: ',
          `${downloadedImageCount++}/${TotalImageNum}`,
          item
        );
      },
      error: (err) => {
        downloadedImageCount--;
        console.log('image download failed ❌');
      },
      complete: () => {
        console.log('image download complete ✅');
      },
    });
}
