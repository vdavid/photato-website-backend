const GetSignedUrlHandler = require('./GetSignedUrlHandler.js');

module.exports.handler = async (event, context) => {
    const handler = new GetSignedUrlHandler();
    return handler.handleRequest(event, context);
};