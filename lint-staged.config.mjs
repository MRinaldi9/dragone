import { relative } from 'node:path';

console.log('✅ lint-staged is running!');

/** @type {import('lint-staged').Configuration} */
export default {
  '*.{ts,js}': files => {
    const relFiles = files.map(file => relative(process.cwd(), file)).join(',');
    const commands = [
      'nx format:write --libs-and-apps',
      `nx run-many -p @dragone/ui --targets=lint,test`,
    ];

    return relFiles.includes('libs/dragone') ? commands : commands.splice(1, 1);
  },
};
