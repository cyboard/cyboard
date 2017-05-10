import { Wallboard as Board } from './components/Wallboard';
import { Widget } from './components/Widget';
import React  from 'react';
import invariant from 'invariant';

function createSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/, '-');
}

function createWidgetFromReactElement(element, board) {
    const type = element.type;
    const widget = { ...type.defaultProps, ...element.props };
    const idx = board.children.indexOf(element);

    widget.id = `${board.slug}-${idx}`;

    if (widget.children) {
        widget.render = widget.children;
        delete widget.children;
    }

    return widget;
}

function createWidgetsFromReactChildren(children, board) {
    const widgets = [];

    React.Children.forEach(children, (element) => {
        if (React.isValidElement(element)) {
            widgets.push(createWidgetFromReactElement(element, board));
        }
    });

    return widgets;
}

function createBoardFromReactElement(element) {
    const type = element.type;
    const board = { ...type.defaultProps, ...element.props };

    board.slug = createSlug(board.name, { lower: true });

    if (board.children) {
        const widgets = createWidgetsFromReactChildren(board.children, board);

        if (widgets.length) {
            board.widgets = widgets;
        }

        delete board.children;
    }

    return board;
}

function createBoardsFromReactChildren(children) {
    const boards = [];

    React.Children.forEach(children, (element) => {
        if (React.isValidElement(element)) {
            boards.push(createBoardFromReactElement(element));
        }
    });

    return boards;
}

export function parseConfig(config) {
    const result = {};

    if (process.env.NODE_ENV !== 'production') {
        if (!React.isValidElement(config)) {
            invariant(false, 'Cyboard config need to be a react element of <Cyboard /> component.');
        }
    }

    const boards = createBoardsFromReactChildren(config.props.children);

    boards.forEach((board) => {
        result[board.slug] = board;
    });

    return result;
}
