import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import createDebug from 'debug';

import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/switchMap';

const debug = createDebug('cyboard.server');

const handleRetry = id => (errors) => {
    let timer = 1;
    return errors.switchMap(() => {
        const delay = 2 * timer;
        timer += 1;
        debug(`widget backend ${id} failed. Retry in ${delay} seconds.`);
        return Observable.timer(delay * 1000);
    });
};

const wrapWidgetData = id => data => ({ id, data });

function createHotObservable(widget) {
    // const subject = new Subject();
    // backend.subscribe(subject);
    // return new Observable((observer) => subject.subscribe(observer));

    return Observable.from(widget.backend)
        .retryWhen(handleRetry(widget.id))
        .map(wrapWidgetData(widget.id));
}

export function mergeWidgetBackends(config) {
    const backends = Object.values(config)
        .reduce((widgets, board) => widgets.concat(board.widgets), [])
        .filter(widget => !!widget)
        .map(widget => createHotObservable(widget));

    return Observable.merge(...backends);
}
