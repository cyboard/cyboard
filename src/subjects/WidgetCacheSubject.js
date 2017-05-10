import { Subject } from 'rxjs/Subject';
import { ObjectUnsubscribedError } from 'rxjs/util/ObjectUnsubscribedError';
import { Subscription } from 'rxjs/Subscription';
import { SubjectSubscription } from 'rxjs/SubjectSubscription';

export class WidgetCacheSubject extends Subject {

    constructor(...args) {
        super(...args);
        this.cache = new Map();
    }

    next(value) {
        this.cache.set(value.id, value);
        return super.next(value);
    }

    _subscribe(subscriber) {
        let subscription;

        if (this.closed) {
            throw new ObjectUnsubscribedError();
        } else if (this.hasError) {
            subscription = Subscription.EMPTY;
        } else if (this.isStopped) {
            subscription = Subscription.EMPTY;
        } else {
            this.observers.push(subscriber);
            subscription = new SubjectSubscription(this, subscriber);
        }

        this.cache.forEach(data => subscriber.next(data));

        if (this.hasError) {
            subscriber.error(this.thrownError);
        } else if (this.isStopped) {
            subscriber.complete();
        }

        return subscription;
    }
}
