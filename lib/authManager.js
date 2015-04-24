var fs = require('fs');

module.exports = function() {

    /**
     * Object with global authentication credentials
     *
     * @private
     * @type {{}}
     */
    var auth = {};

    return {

        /**
         * Loads json file with authentication credentials from the given path
         *
         * @param {string} path
         */
        load: function(path) {
            auth = require(path);
        },

        /**
         * Returns authentication credentials for the given key
         *
         * @param {string} key
         * @returns {object}
         */
        get: function(key) {
            if (!auth[key]) {
                throw new Error('No authorization informations found for key ' + key);
            }
            return auth[key];
        },

        /**
         * Returns true if there are credentials for the given key
         *
         * @param {string} key
         * @returns {boolean}
         */
        has: function(key) {
            return !!auth[key];
        },

        /**
         * Returns the value for the authentication header for a Basic authentication. By default this method
         * expects the keys `username` and `password` in the credentials object. This can be modified with
         * the both parameters `usernameProperty` and `passwordProperty` of this function.
         *
         * @param {string} key
         * @param {string} usernameProperty
         * @param {string} passwordProperty
         * @returns {string}
         */
        getBasicAuthHeader: function(key, usernameProperty, passwordProperty) {

            var authInfo = this.get(key),
                username, password;

            usernameProperty = usernameProperty || 'username';
            passwordProperty = passwordProperty || 'password';

            username = authInfo[usernameProperty];
            password = authInfo[passwordProperty];

            return 'Basic ' + new Buffer(username + ':' + password).toString('base64');
        }
    }
};
