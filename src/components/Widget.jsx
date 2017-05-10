import React, { Component } from 'react';
import PropTypes from '../CustomPropTypes';
import invariant from 'invariant';

export class Widget extends Component {

    static propTypes = {
        children: PropTypes.func.isRequired,
        shape: PropTypes.shape({
            top: PropTypes.number.isRequired,
            left: PropTypes.number.isRequired,
            width: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,
        }).isRequired,
        backend: PropTypes.shape({
            subscribe: PropTypes.func,
        }).isRequired,
    };

    render() {
        invariant(
            false,
            '<Widget> elements are for cyboard configuration only and should not be rendered',
        );
    }
}
