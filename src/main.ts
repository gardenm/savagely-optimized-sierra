import '@fontsource/lilita-one/latin-400.css';
import '@fontsource/comic-neue/latin-400.css';
import '@fontsource/comic-neue/latin-700.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import './style.css';
import { startApp } from './app';
import { required } from './ui/dom';

const dispose = startApp(required(document, '#app'));
if (import.meta.hot) import.meta.hot.dispose(dispose);
