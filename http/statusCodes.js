/**
 * Constants enumerating the HTTP status codes.
 *
 * All status codes defined in RFC1945 (HTTP/1.0, RFC2616 (HTTP/1.1),
 * RFC2518 (WebDAV), RFC6585 (Additional HTTP Status Codes), and
 * RFC7538 (Permanent Redirect) are supported.
 *
 * Based on the org.apache.commons.httpclient.HttpStatus Java API.
 *
 * Ported by Bryce Neal.
 */
const httpStatusCodes = {
    ACCEPTED: 202,
    BAD_GATEWAY: 502,
    BAD_REQUEST: 400,
    CONFLICT: 409,
    CONTINUE: 100,
    CREATED: 201,
    EXPECTATION_FAILED: 417,
    FAILED_DEPENDENCY: 424,
    FORBIDDEN: 403,
    GATEWAY_TIMEOUT: 504,
    GONE: 410,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    IM_A_TEAPOT: 418,
    INSUFFICIENT_SPACE_ON_RESOURCE: 419,
    INSUFFICIENT_STORAGE: 507,
    INTERNAL_SERVER_ERROR: 500,
    LENGTH_REQUIRED: 411,
    LOCKED: 423,
    METHOD_FAILURE: 420,
    METHOD_NOT_ALLOWED: 405,
    MOVED_PERMANENTLY: 301,
    MOVED_TEMPORARILY: 302,
    MULTI_STATUS: 207,
    MULTIPLE_CHOICES: 300,
    NETWORK_AUTHENTICATION_REQUIRED: 511,
    NO_CONTENT: 204,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NOT_ACCEPTABLE: 406,
    NOT_FOUND: 404,
    NOT_IMPLEMENTED: 501,
    NOT_MODIFIED: 304,
    OK: 200,
    PARTIAL_CONTENT: 206,
    PAYMENT_REQUIRED: 402,
    PERMANENT_REDIRECT: 308,
    PRECONDITION_FAILED: 412,
    PRECONDITION_REQUIRED: 428,
    PROCESSING: 102,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    REQUEST_TIMEOUT: 408,
    REQUEST_TOO_LONG: 413,
    REQUEST_URI_TOO_LONG: 414,
    REQUESTED_RANGE_NOT_SATISFIABLE: 416,
    RESET_CONTENT: 205,
    SEE_OTHER: 303,
    SERVICE_UNAVAILABLE: 503,
    SWITCHING_PROTOCOLS: 101,
    TEMPORARY_REDIRECT: 307,
    TOO_MANY_REQUESTS: 429,
    UNAUTHORIZED: 401,
    UNPROCESSABLE_ENTITY: 422,
    UNSUPPORTED_MEDIA_TYPE: 415,
    USE_PROXY: 305,
};

const statusCodeToDescriptionMap = {
    202: "Accepted",
    502: "Bad Gateway",
    400: "Bad Request",
    409: "Conflict",
    100: "Continue",
    201: "Created",
    417: "Expectation Failed",
    424: "Failed Dependency",
    403: "Forbidden",
    504: "Gateway Timeout",
    410: "Gone",
    505: "HTTP Version Not Supported",
    418: "I'm a teapot",
    419: "Insufficient Space on Resource",
    507: "Insufficient Storage",
    500: "Server Error",
    411: "Length Required",
    423: "Locked",
    420: "Method Failure",
    405: "Method Not Allowed",
    301: "Moved Permanently",
    302: "Moved Temporarily",
    207: "Multi-Status",
    300: "Multiple Choices",
    511: "Network Authentication Required",
    204: "No Content",
    203: "Non Authoritative Information",
    406: "Not Acceptable",
    404: "Not Found",
    501: "Not Implemented",
    304: "Not Modified",
    200: "OK",
    206: "Partial Content",
    402: "Payment Required",
    308: "Permanent Redirect",
    412: "Precondition Failed",
    428: "Precondition Required",
    102: "Processing",
    407: "Proxy Authentication Required",
    431: "Request Header Fields Too Large",
    408: "Request Timeout",
    413: "Request Entity Too Large",
    414: "Request-URI Too Long",
    416: "Requested Range Not Satisfiable",
    205: "Reset Content",
    303: "See Other",
    503: "Service Unavailable",
    101: "Switching Protocols",
    307: "Temporary Redirect",
    429: "Too Many Requests",
    401: "Unauthorized",
    422: "Unprocessable Entity",
    415: "Unsupported Media Type",
    305: "Use Proxy",
};

/**
 * @param {int} statusCode
 * @returns {string|undefined} The description, or undefined if not found.
 */
function getStatusDescription(statusCode) {
    return statusCodeToDescriptionMap[statusCode];
}

/**
 * @param {string} reasonPhrase
 * @returns {int|undefined} The code, or undefined if not found.
 */
function getStatusCode(reasonPhrase) {
    const [key] = Object.entries(statusCodeToDescriptionMap).find(([, value]) => value === reasonPhrase);
    return key ? parseInt(key) : undefined;
}

module.exports = {
    httpStatusCodes,
    getStatusDescription,
    getStatusCode,
}