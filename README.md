Cyboard
=======

Cyboard is a Node.js based event driven wallboard server for serving nice dashboards for your team. Is was inspired
by Atlasboard and followes mostly the same concepts, but is intended to be more flexible. It gives you a lot of ways
to customize your wallboards for your specialized needs.

Installation and usage
----------------------
Cyboard is not cocepted as an global app. Just install it as a local dependency to your node project

    $ mkdir MyBoard
    $ cd MyBoard
    $ npm install --save cyboard
    
The server is one part. We need a widget to get displayed. Lets install the clock widget for example.

    $ npm install --save cyboard-clock
    
Once cyboard is installed, create a javascript (e.g. `index.js`) file and add the follwing content.

    var server = require('cyboard')(),
        board = server.createBoard('Team A');
        
    board.addWidget('clock', {
        top: 1,
        left: 1,
        width: 5,
        height: 2
    });
    
    server.listen(3000, function() {
        console.info("Server listening on http://localhost:%s", 3000);
    });
    
Now, your server can get started by running your script

    $ node index.js
    
    
Further documentations
----------------------

1.  [Plugin Basics](docs/pluginBasics.md)
2.  [Creating widgets](docs/creatingWidgets.md)
3.  Overloading templates
4.  Adding custom styles
5.  Load your own angular module