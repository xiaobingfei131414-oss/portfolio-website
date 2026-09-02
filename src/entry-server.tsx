import { renderToString } from 'react-dom/server';
import { App } from './App';
export { pagePaths, pageMetadata } from './portfolio';
export function render(pathname: string) { return renderToString(<App pathname={pathname} />); }
