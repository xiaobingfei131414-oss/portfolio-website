import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './portfolio.css';
import './chrome.css';
import './works.css';
import './theme.css';

const root = document.getElementById('root')!;
const app = <App pathname={window.location.pathname} />;
if (root.innerHTML.trim() && !root.innerHTML.includes('<!--app-html-->')) hydrateRoot(root, app);
else createRoot(root).render(app);
