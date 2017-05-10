import React, { Component } from 'react';
import { createComponent, ThemeProvider } from 'react-fela';
import PropTypes from '../CustomPropTypes';
import RenderWidget from './Widget';
import theme from './theme';

const boardContainer = () => ({
    background: '#21252b',
    color: '#e2e2e2',
    position: 'absolute',
    width: '100vw',
    height: '100vh',
});

const BoardContainer = createComponent(boardContainer);

const OfflineHint = createComponent(() => ({
    background: 'red',
    position: 'fixed',
    bottom: 0,
    right: 0,
}));

class RenderBoard extends Component {

    static propTypes = {
        widgets: PropTypes.array.isRequired,
        horizontal: PropTypes.number,
        vertical: PropTypes.number,
    };

    static defaultProps = {
        horizontal: 16,
        vertical: 9,
    };

    static contextTypes = {
        getOnlineStatus: PropTypes.func,
    };

    state = {
        online: true,
    };

    componentDidMount() {
        this.context.getOnlineStatus()
            .subscribe(online => this.setState({ ...this.state, online }));
    }

    getWidgetShapeStyles({ top, left, width, height }) {
        const { horizontal, vertical } = this.props;
        return {
            top: `${(100 / vertical) * top}vh`,
            left: `${(100 / horizontal) * left}vw`,
            height: `${(100 / vertical) * height}vh`,
            width: `${(100 / horizontal) * width}vw`,
        };
    }

    render() {
        const { widgets } = this.props;
        return (
            <ThemeProvider theme={theme}>
                <BoardContainer>
                    {widgets.map(widget => (
                        <RenderWidget key={widget.id}
                                position={this.getWidgetShapeStyles(widget.shape)}
                                backend={widget.backend}
                                render={widget.render} />
                    ))}
                    {!this.state.online && <OfflineHint>Offline</OfflineHint>}
                </BoardContainer>
            </ThemeProvider>
        );
    }
}

export default RenderBoard;
