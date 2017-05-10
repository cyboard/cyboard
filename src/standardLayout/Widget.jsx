import React, { Component } from 'react';
import { createComponent } from 'react-fela';
import PropTypes from '../CustomPropTypes';

const InnerContainer = createComponent(() => ({
    flex: '1',
    boxSizing: 'border-box',
    background: '#282c34',
    overflow: 'hidden',
    padding: '2vmin',
}));

const OuterContainer = createComponent(({ position }) => ({
    alignItems: 'stretch',
    position: 'absolute',
    boxSizing: 'border-box',
    padding: '1vmin',
    display: 'flex',
    ...position,
}));

class RenderWidget extends Component {

    static propTypes = {
        position: PropTypes.shape({
            height: PropTypes.string,
            left: PropTypes.string,
            top: PropTypes.string,
            width: PropTypes.string,
        }).isRequired,
    };

    state = {
        data: {},
    }

    componentWillMount() {
        this.subscription = this.props.backend.subscribe(data => this.setState(data));
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    render() {
        return (
            <OuterContainer position={this.props.position}>
                <InnerContainer>
                    {this.props.render(this.state)}
                </InnerContainer>
            </OuterContainer>
        );
    }
}

export default RenderWidget;
