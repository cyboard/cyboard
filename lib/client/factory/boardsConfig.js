module.exports = function($http) {
    return $http.get('/api/boards').then(function(response) {
        return response.data;
    });
}