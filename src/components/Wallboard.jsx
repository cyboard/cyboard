import React, { Component } from 'react';
import invariant from 'invariant';
import PropTypes from '../CustomPropTypes';
import { Widget } from './Widget';

export class Wallboard extends Component {

    static propTypes = {
        name: PropTypes.string.isRequired,
        children: PropTypes.childrenOf(Widget),
    };

    static defaultProps = {
        children: [],
    }

    render() {
        invariant(
            false,
            '<Wallboard> elements are for cyboard configuration only and should not be rendered',
        );
    }
}
