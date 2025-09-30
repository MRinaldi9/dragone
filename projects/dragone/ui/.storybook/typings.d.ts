import 'storybook/test';
declare module '*.md' {
  const content: string;
  export default content;
}
