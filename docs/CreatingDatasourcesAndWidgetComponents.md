Creating Data Sources and Widget Components
===========================================

Data sources and react components are the two core concepts in *Cyboard*. Every data source is just an observable which emits data each time the frontend widget should be updated. Data is can be any JSON compatible object structure.

As the configuration of a wallboard will be executed in the backend and the frontend, the data source will only be subscribed in the backend. This is done to reduce duplicated data fetching and enable secure handling of api credentials. After the backend subscribed each datasource it will transport its data to the frontend where a widget component receives and renders the informations.

Writing a data source
---------------------
Data source are responsible for generating data. In our examples we use [RxJS][1] which is also used internally by cyboard. But your data source should be fine as long it follows the observable interface.

The wallboard can only be as much realtime as your data sources are. But the most APIs doesn't support a realtime communication. In this case we need a timer  which trigger our requests. To get started we write a really simple data source which increments a counter on a specified interval. The most data sources need some kind of configuration, so it convinient to export a factory function which accepts some options and return the required observable.

```javascript
import { Observable } from 'rxjs/Rx';

function createDataSource(options) {
    const { interval = 20000 } = options;
    const dataSource = Observable.timer(0, interval)

    return dataSource;
}

export default createDataSource;
```

Because `Observalbe.timer` already emits a increasing number, we don't need to do more. But a counter seems a litle bit odd for an example. Lets extend our data source to fetch a JSON and return some data of the response. This is also just RxJS and nothing special.

```javascript
import { Observable } from 'rxjs/Rx';

function createDataSource(options) {
    const { interval = 20000 } = options;
    const dataSource = Observable.timer(0, interval)
        .switchMap(() => {
            return Observable.ajax('https://www.reddit.com/r/reactiongifs.json')
                .map((event) => {
                    const latestPost = event.response.data.children[0].data;
                    const { title } = latestPost;
                    const firstImage = latestPost.preview.images[0];
                    const { url, width, height } = firstImage.variants.gif.source;
                    return { title, url, width, height };
                })
                .catch(error => Observable.of(error));
        });

    return dataSource;
}

export default createDataSource;
```

To test our created data source we can easily invoke the factory function and subscribe the returned observable. If everything went ok, we should see a console log with the fetched informations.

```javascript
import createReactionGifsSource from './myDataSource';

const dataSource = createReactionGifsSource({ interval: 5000 });

dataSource.subscribe(data => console.log(data));
```

Writing the widget component
----------------------------

Now we have a stream of informations and need to visualize them. When defining a widget for a wallboard we need to pass a render function which is invoked each time the observable emits data. Cyboard will then intercept the connection between widget and observable and put itself in between to handle the server-client relation.

But to keep things simple lets skip all the cyboard stuff, and render the widget our self every time our observable emits data.

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import createReactionGifsSource from './myDataSource';

const targetEl = document.getElementByID('root');
const dataSource = createReactionGifsSource({ interval: 5000 });

const ReactionGif = (props) => (
    <div>
        <h1>{props.title}</h1>
        <img src={props.url} alt={props.title} />
    </div>
);

dataSource.subscribe(data =>
    React.render(<ReactionGif {...data}) />, targetEl)
);
```

In the code above we have a small [react component][4] called `ReactionGif` which expects the two properties title and url. To keep the example short, we skipped the [prop types validation][5]. We subscribe our previously created observable, and render our component in the callback using `ReactDOM.render`.

Bringing all together in a cyboard context is pretty much the same concept. You define a function which **renders** a react component and pass it to the `Widget` component. `Widget` takes also the observable and each time it emits data, our render function will be called.

```javascript
import { Cyboard, Wallboard, Widget } from 'cyboard';
import createReactionGifsSource from './src/myDataSource';
import ReactionGif from './src/ReactionGif'

export default (auth) => {
    const currentTime = createReactionGifsSource();

    return (
        <Cyboard>
            <Wallboard name="Team Adler">
                <Widget backend={currentTime}>
                    {data => <ReactionGif {...data} />}
                </Widget>
            </Wallboard>
        </Cyboard>
    );
};
```

Creating realtime sources
-------------------------
As mentioned before, a realtime data source depends on the api you war using. You need to be notified about changes to emit data on your observable. This could be done by totally different solutions. You may be notified by a [pubsub service like redis][2] or consume a [streaming API like the one from twitter][3]. The implementation will be always the same. Just observables.

```javascript
import { Client } from 'some-realtime-api';

function createDataSource(options) {
    const { username, password } = options;
    return new Observable((observer) => (
        const api = new Client(username, password);

        api.on('data', data => observer.next(data));
        api.on('error', error => observer.error(error));

        return () => api.disconnect();
    ));

}

export default createDataSource;
```

[1]: http://reactivex.io/rxjs/
[2]: https://redis.io/topics/pubsub
[3]: https://dev.twitter.com/streaming/overview
[4]: https://facebook.github.io/react/docs/react-component.html
[5]: https://facebook.github.io/react/docs/typechecking-with-proptypes.html
