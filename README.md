Cyboard - A realtime Wallboard Solution
=======================================

Cyboard is a react based wallboard solution for creating realtime wallboards. It uses observable to
generate the data on a nodejs server, passes this data in realtime to a connected webbrowser and
renders This data simply using react components. The rest is up to you.

Getting started
---------------
First, we need to install `cyboard` into your project. It contains some basic react components and
an executable to run our wallboard.

```
$ npm install cyboard
```

Now we need a configuration for our wallboard. This is done in a file called `Cyboardfile.js`. This
file needs to export a function that returns a react element tree which represents the actual
configuration. We need also to import all the *data sources* and *widget components* we want to use.

```javascript
import React from 'react';
import { Cyboard } from 'cyboard';
import { createClockBackend, ClockComponent } from 'cyboard-clock';

export default () => {
    const currentTime = createClockBackend();

    <Cyboard>
        <Board name="My first Wallboard">
            <Widget shape={{ top: 0, left: 0, height: 2, width: 5 }} backend={currentTime}>
                {data => <ClockComponent {...data} />}
            </Widget>
        </Board>
    </Cyboard>
}
```

In this example we create a datasource for displaying a clock. Its just an observable which passes the current time to each full minute. This observable is passed to the `Widget` component. We are also passing a render function as children to this `Widget` component. Its job is to return a react element for the passed data object. Each time the observable emits new data, this function will be called and react will update to DOM according to the returned react element.

The `Cyboard` component serves as a wrapper for the hole configuration tree and needs no configuration.

The `Board` component wraps all widgets which should be displayed on a screen. It takes a `name` property which is used to refer to this board on the navigation screen.

Finally we launch our wallboard server using the `cyboard` CLI.

```
$ ./node_modules/.bin/cyboard start
```

Further documentations
----------------------
1. Using secret credentials
2. [Creating data sources and components](docs/CreatingDatasourcesAndWidgetComponents.md)
3. Creating custom layouts
4. Optimizations for production
