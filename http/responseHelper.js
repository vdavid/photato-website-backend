const {getStatusDescription} = require('./statusCodes.js');

/**
 * @param {int} statusCode
 * @param {string} body
 * @param {string} [contentType] Default is 'text/plain'.
 * @returns {object}
 * @private
 */
function buildResponse(statusCode, body, {contentType = 'text/plain'} = {}) {
    return {
        status: statusCode,
        statusDescription: getStatusDescription(statusCode),
        headers: {
            'content-type': [{key: 'Content-Type', value: contentType}],
            'content-encoding': [{key: 'Content-Encoding', value: 'UTF-8'}],
            'access-control-allow-origin': [{key: 'Access-Control-Allow-Origin', value: '*'}],
        },
        body,
    };
}

/**
 * @param {string[]} allowedMethods
 * @returns {Object}
 */
function buildOptionsResponse(allowedMethods) {
    return {
        status: 200,
        statusDescription: 'OK',
        headers: {
            'access-control-allow-origin': [{key: 'Access-Control-Allow-Origin', value: '*'}],
            'access-control-allow-methods': [{key: 'Access-Control-Allow-Methods', value: allowedMethods.join(', ')}],
            'access-control-allow-headers': [{key: 'Access-Control-Allow-Headers', value: '*'}],
        },
    };
}

module.exports = {
    buildResponse,
    buildOptionsResponse,
}