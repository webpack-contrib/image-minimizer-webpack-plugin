import fs from 'fs';
import path from 'path';

export default function loader(content) {
  const filename = 'loader-test.jpg';
  const fileContent = fs.readFileSync(path.resolve(filename));
  this.emitFile(filename, fileContent);

  const callback = this.async();

  return callback(null, content);
}
