// @ts-expect-error — react-h5-audio-player doesn't provide a CSS declaration
import 'react-h5-audio-player/lib/styles.css';
// @ts-expect-error — abcjs doesn't provide a CSS declaration
import 'abcjs/abcjs-audio.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

ReactDOM.createRoot(
    document.getElementById('root')!
).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);