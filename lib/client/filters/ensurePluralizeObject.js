module.exports = function() {
    return function(value) {
        return typeof value === "object" ? value : {"one": value, "other": value};
    }
}
