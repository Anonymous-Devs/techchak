"use strict"
const path = require('path');
const {
    HTTP_UNPROCESSABLE_ENTITY,
    HTTP_OK
} = require(path.resolve('utils/http.response.code'));
const validator = async (schema, body) => {
    try {
        // if the validation succeded it will return the processed data
        const data = await schema.validateAsync(body);
        // return the data and ok
        return {
            ok: true,
            code: HTTP_OK,
            data
        };
    } catch (err) {
        logger.error(err);
        // gets the error message out of the joi error
        const {
            message
        } = err.details[0];
        //  respond with error to the client
        return {
            ok: false,
            code: HTTP_UNPROCESSABLE_ENTITY,
            error: message
        };
    }
};

module.exports = validator;