import React from 'react';
import { parseConfig } from './parseConfig';
import { Cyboard, Board, Widget } from './';

test('parsing a react elements tree', () => {
    const fakeBackend = { subscribe: () => {} };
    const fakeRenderFunc = () => {};
    const boards = parseConfig(
        <Cyboard>
            <Board name="Teams Testboard">
                <Widget shape={{ top: 0, left: 0, height: 2, width: 5 }} backend={fakeBackend}>
                    {fakeRenderFunc}
                </Widget>
                <Widget shape={{ top: 0, left: 0, height: 2, width: 5 }} backend={fakeBackend}>
                    {fakeRenderFunc}
                </Widget>
            </Board>
        </Cyboard>,
    );

    expect(boards).toEqual({
        'teams-testboard': {
            name: 'Teams Testboard',
            slug: 'teams-testboard',
            widgets: [{
                id: 'teams-testboard-0',
                backend: fakeBackend,
                shape: { top: 0, left: 0, height: 2, width: 5 },
                render: fakeRenderFunc,
            }, {
                id: 'teams-testboard-1',
                backend: fakeBackend,
                shape: { top: 0, left: 0, height: 2, width: 5 },
                render: fakeRenderFunc,
            }],
        },
    });
});

test('parsing a plain object throw error', () => {
    expect(() => parseConfig({})).toThrow();
});
