import React, { Component } from 'react';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import 'rxjs/add/observable/from';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';

import PropTypes from '../CustomPropTypes';
import { WidgetCacheSubject } from '../subjects/WidgetCacheSubject';

export class ServerEventsProvider extends Component {

    static propTypes = {
        children: PropTypes.element.isRequired,
        source: PropTypes.instanceOf(EventSource).isRequired,
    };

    static childContextTypes = {
        getSocketStream: PropTypes.func,
        getOnlineStatus: PropTypes.func,
        registerBoard: PropTypes.func,
    };

    getChildContext() {
        return {
            getSocketStream: id => this.getWidgetStream(id),
            getOnlineStatus: () => Observable.from(this.online).distinctUntilChanged(),
        };
    }

    componentDidMount() {
        this.props.source.addEventListener('message', ({ data }) => {
            const parsedData = JSON.parse(data);
            this.subject.next(parsedData);
        });

        this.props.source.addEventListener('error', () => {
            this.online.next(false);
        });

        this.props.source.addEventListener('open', () => {
            this.online.next(true);
        });
    }

    online = new ReplaySubject(1);

    getWidgetStream(id) {
        return Observable.from(this.subject)
            .filter(data => data.id === id)
            .map(data => data.data);
    }

    subject = new WidgetCacheSubject();

    render() {
        return this.props.children;
    }
}
