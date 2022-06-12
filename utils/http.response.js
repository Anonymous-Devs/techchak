
module.exports = class Response {
    static gen(code, message, data) {
        return {code, message, data};
    }
}
 