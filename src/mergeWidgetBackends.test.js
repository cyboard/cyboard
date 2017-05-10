import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { mergeWidgetBackends } from './mergeWidgetBackends';

test('returns observable', () => {
    const backends = mergeWidgetBackends({});
    expect(backends).toBeInstanceOf(Observable);
});

test('merges data from all backends', () => {
    const backendA = new Subject();
    const backendB = new Subject();
    const subscriber = jest.fn();

    const backends = mergeWidgetBackends({
        board: {
            widgets: [
                { backend: backendA },
                { backend: backendB },
            ],
        },
    });

    backends.subscribe(subscriber);

    backendA.next(1);
    backendB.next(2);

    expect(subscriber).toHaveBeenCalledTimes(2);
});

test('works with boards without widgets', () => {
    const backends = mergeWidgetBackends({
        board: {},
    });
    expect(backends).toBeInstanceOf(Observable);
});
