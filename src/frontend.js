import React from 'react';
import ReactDOM from 'react-dom';
import { createRenderer as createFelaRenderer } from 'fela';
import { Provider as FelaProvider, ThemeProvider } from 'react-fela';
import { ServerEventsProvider } from './components/ServerEventsProvider';

// Here we get the config injected by webpack. This is done with a custom
// alias, which is configured in config/webpack.config.dev.js
import config from 'injected-boards-config'; // eslint-disable-line

// Create event source stream for server sent events, this is where the
// widget backends send their data
const serverEvents = new EventSource(`${location.origin}/events`);

// Create the apps container element
const app = document.createElement('div');
app.id = 'app';
document.body.appendChild(app);

// Create a style element in head for fela to render into
const styles = document.createElement('style');
document.head.appendChild(styles);

// Instanciate fela renderer
const felaRenderer = createFelaRenderer();

// Render styles for container elements to enable full screen styling
felaRenderer.renderStatic({
    height: '100%',
    margin: 0,
}, 'html, body, #app');

// Render the app
ReactDOM.render(
    React.createElement(FelaProvider, { renderer: felaRenderer, mountNode: styles },
        React.createElement(ThemeProvider, { theme: {} },
            React.createElement(ServerEventsProvider, { source: serverEvents },
                config({}),
            ),
        ),
    ),
    app,
);
