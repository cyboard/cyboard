export function observableEventSource(observable) {
    return function observableEventSourceMiddleware(req, res) {
        if (!req.accepts('text/event-stream')) {
            res.status(400).send('This endpoint implements sever sent events.');
            return;
        }

        req.socket.setKeepAlive(true);
        req.socket.setTimeout(0);

        //send headers for event-stream connection
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive', // eslint-disable-line quote-props
        });

        res.write('\n');

        const subscription = observable.subscribe((data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
            if (res.flushHeaders) res.flushHeaders();
        });

        // // keep the connection open by sending a comment
        // var keepAlive = setInterval(function() {
        //   res.sse(':keep-alive\n\n');
        // }, 20000);
        //
        // // cleanup on close
        // res.on('close', function close() {
        //   clearInterval(keepAlive);
        // });

        req.on('close', () => subscription.unsubscribe());
    };
}
