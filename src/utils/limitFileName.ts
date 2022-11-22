const MAX_FILE_NAME_LENGTH = 255;
const PREFIX_IMAGE_NUMBER = 4;

const limitFileName = (fileName: string) => {
  const text = new TextEncoder().encode(fileName);
  if (text.byteLength >= MAX_FILE_NAME_LENGTH) {
    const [name, ext] = fileName.split('.') as [string, string];

    const nameBytes = new TextEncoder().encode(name);
    const extBytes = new TextEncoder().encode(ext);

    const slicedNameBytes = nameBytes.subarray(
      0,
      MAX_FILE_NAME_LENGTH - extBytes.byteLength - PREFIX_IMAGE_NUMBER - 1
    );

    const uft8decoder = new TextDecoder();

    const newName = `${uft8decoder.decode(
      slicedNameBytes
    )}.${uft8decoder.decode(extBytes)}`;
    console.log(`file name changed  ${fileName} -> ${newName}`);

    return newName;
  }
  return fileName;
};

export default limitFileName;
