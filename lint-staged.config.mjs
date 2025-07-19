import { relative } from 'node:path';
export default {
  '*.{ts,js}': files => {
    const absFiles = files.join(',');

    const relFiles = files.map(file => relative(process.cwd(), file)).join(',');
    return [
      `nx format:check --files=${absFiles}`,
      `nx affected --targets=lint,test --files=${relFiles}`,
    ];
  },
};
