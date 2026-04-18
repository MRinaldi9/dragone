/// <reference types="storybook/test" />
declare module '*.css';

declare module '*.md' {
  const content: string;
  export default content;
}
