import { relative } from 'node:path';

console.log('✅ lint-staged is running!');

/** @type {import('lint-staged').Configuration} */
export default {
  '*.{ts,js}': files => {
    const relFiles = files.map(file => relative(process.cwd(), file)).join(',');
    return [
      `nx format:write --files=${relFiles}`,
      relFiles.includes('libs/dragone') ?
        `nx run-many -p @dragone/ui --targets=lint,test`
      : '',
    ];
  },
};
