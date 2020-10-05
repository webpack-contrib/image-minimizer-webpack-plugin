import path from 'path';

function interpolateName(name, filename) {
  const match = /^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(name);
  const [, replacerFile] = match;
  const replacerQuery = match[2] || '';
  const replacerFragment = match[3] || '';
  const replacerExt = path.extname(replacerFile);
  const replacerBase = path.basename(replacerFile);
  const replacerName = replacerBase.slice(
    0,
    replacerBase.length - replacerExt.length
  );
  const replacerPath = replacerFile.slice(
    0,
    replacerFile.length - replacerBase.length
  );
  const pathData = {
    file: replacerFile,
    query: replacerQuery,
    fragment: replacerFragment,
    path: replacerPath,
    base: replacerBase,
    name: replacerName,
    ext: replacerExt || '',
  };

  let newName = filename;

  if (typeof newName === 'function') {
    newName = newName(pathData);
  }

  return newName.replace(
    /\[(file|query|fragment|path|base|name|ext)]/g,
    (p0, p1) => pathData[p1]
  );
}

export default interpolateName;
