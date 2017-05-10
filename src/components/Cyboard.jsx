import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import PropTypes from '../CustomPropTypes';
import { Wallboard as Board } from './Wallboard';
import BoardsOverview from './BoardsOverview';
import { parseConfig } from '../parseConfig';
import RenderBoard from '../standardLayout/Board';

export class Cyboard extends Component {

    static propTypes = {
        children: PropTypes.childrenOf(Board).isRequired,
    }

    static contextTypes = {
        getSocketStream: PropTypes.func,
    };

    componentWillMount() {
        this.config = parseConfig(<Cyboard>{this.props.children}</Cyboard>);

        Object.values(this.config).forEach((board) => {
            const widgets = board.widgets.map((widget) => {
                const backend = this.context.getSocketStream
                    ? this.context.getSocketStream(widget.id)
                    : widget.backend;

                return { ...widget, backend };
            });
            const WrappedRenderBoard = () => <RenderBoard widgets={widgets} />;
            this.boardRoutes.push(
                <Route path={`/${board.slug}`} key={`route-${board.slug}`} component={WrappedRenderBoard} />,
            );
        });
    }

    boardRoutes = [];

    render() {
        const WrappedBoardsOverview = () => <BoardsOverview boards={Object.values(this.config)} />;

        return (
            <IntlProvider>
                <Router>
                    <div>
                        {[
                            <Route path="/" key="route-index" component={WrappedBoardsOverview} />,
                            ...this.boardRoutes,
                        ]}
                    </div>
                </Router>
            </IntlProvider>
        );
    }
}
