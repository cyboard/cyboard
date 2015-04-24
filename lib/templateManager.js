var path = require('path'),
    serveStatic = require('serve-static');

module.exports = function createTemplateManager(app) {

    return {
        push: function(localPath) {
            if (this.basepath) {
                localPath = path.join(this.basepath, localPath);
            }
            app.use('/templates', serveStatic(localPath));
        },
        bindTo: function(basepath) {
            return Object.create(this, {
                "basepath": {  writable: false, configurable: false, value: basepath }
            });
        }
    };
}
module.exports.$inject = ['app']