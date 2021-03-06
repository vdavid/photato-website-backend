const AWS = require('aws-sdk');
const {getDefaultConfig} = require('./config.js');

const RequestHelper = require('./http/RequestHelper.js');
const ResponseHelper = require('./http/ResponseHelper.js');
const Router = require('./http/Router.js');
const AuthMiddleware = require('./auth/AuthMiddleware.js');
const Auth0AndMongoAuthorizerFactory = require('./auth/Auth0AndMongoAuthorizerFactory.js');

const PhotatoMessageRepository = require('./messages/PhotatoMessageRepository.js');
const PhotoRepository = require('./photos/PhotoRepository.js');

const VersionController = require('./meta/VersionController.js');
const GetAllMessagesController = require('./messages/getAllMessages/GetAllMessagesController.js');
const ListPhotosForWeekController = require('./photos/listPhotosForWeek/ListPhotosForWeekController.js');

/**
 * @typedef {Object} ApiGatewayEvent
 * @property {string} path
 * @property {string} httpMethod
 * @property {Object<string, string>} headers
 * @property {Object<string, string>} queryStringParameters
 */

/**
 * @typedef {Object} LambdaEdgeRecord
 * @property {{request: Object}} cf
 */

/**
 * @typedef {Object} LambdaEdgeEvent
 * @property {LambdaEdgeRecord[]} Records
 * @property {Object} Records.cf
 * @property {Object} Records.cf.request
 */

/**
 * @typedef {Object} LambdaContext Source: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
 * @property {string} functionName The name of the Lambda function.
 * @property {string} functionVersion The version of the function.
 * @property {string} invokedFunctionArn The Amazon Resource Name (ARN) that's used to invoke the function. Indicates if the invoker specified a version number or alias.
 * @property {string} memoryLimitInMB The amount of memory that's allocated for the function.
 * @property {string} awsRequestId The identifier of the invocation request.
 * @property {string} logGroupName The log group for the function.
 * @property {string} logStreamName The log stream for the function instance.
 * @property {string} identity (mobile apps) Information about the Amazon Cognito identity that authorized the request.
 * @property {string} identity.cognitoIdentityId The authenticated Amazon Cognito identity.
 * @property {string} identity.cognitoIdentityPoolId The Amazon Cognito identity pool that authorized the invocation.
 * @property {Object<string, string>} clientContext (mobile apps) Client context that's provided to Lambda by the client application.
 * @property {string} clientContext.client.installation_id
 * @property {string} clientContext.client.app_title
 * @property {string} clientContext.client.app_version_name
 * @property {string} clientContext.client.app_version_code
 * @property {string} clientContext.client.app_package_name
 * @property {string} clientContext.env.platform_version
 * @property {string} clientContext.env.platform
 * @property {string} clientContext.env.make
 * @property {string} clientContext.env.model
 * @property {string} clientContext.env.locale
 * @property {string} callbackWaitsForEmptyEventLoop Set to false to send the response right away when the callback executes, instead of waiting for the Node.js event loop to be empty. If this is false, any outstanding events continue to run during the next invocation.
 */

const defaultConfig = getDefaultConfig();
const router = new Router({appName: defaultConfig.appName});
const s3 = new AWS.S3({region: 'us-east-1', signatureVersion: 'v4'});

/* Create middleware */
const auth0AndMongoAuthorizerFactory = new Auth0AndMongoAuthorizerFactory();

/* Create controllers */
const versionController = new VersionController();
const photatoMessageRepository = new PhotatoMessageRepository();
const photoRepository = new PhotoRepository(s3, defaultConfig.photos.bucket.name);
const getAllMessagesController = new GetAllMessagesController({photatoMessageRepository});
const listPhotosForWeekController = new ListPhotosForWeekController({photoRepository});

/**
 * @param {ApiGatewayEvent|LambdaEdgeEvent} event For formats:
 *        API Gateway: See https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html
 *        Lambda@Edge: See https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html
 * @param {LambdaContext} context See https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
 * @returns {Promise<ApiGatewayResponse|LambdaEdgeResponse>}
 */
async function main(event, context) {
    /* Parse request and set up response */
    const requestHelper = new RequestHelper(event, context);
    const responseHelper = new ResponseHelper(requestHelper.eventSource);

    /* Log */
    console.debug(`${context.functionName} | Got ${requestHelper.getRequestData().method} request in ${requestHelper.getEnvironment()} via ${requestHelper.eventSource}.`, {event, context});

    /* Resolve routes */
    try {
        const auth0AndMongoAuthorizer = await auth0AndMongoAuthorizerFactory.createForEnvironment(requestHelper.getEnvironment());
        const authMiddleware = new AuthMiddleware(auth0AndMongoAuthorizer);
        /** @type {ApiGatewayResponse|LambdaEdgeResponse} */
        const result = await router.resolveRoutes(event, context, [
            {functionName: 'getVersion', method: 'GET', middlewareSequence: [authMiddleware.isAdmin.bind(authMiddleware), versionController.handleGetRequest.bind(versionController)]},
            {functionName: 'adminGetAllMessages', method: 'OPTIONS', middlewareSequence: [getAllMessagesController.handleOptionsRequest.bind(getAllMessagesController)]},
            {functionName: 'adminGetAllMessages', method: 'GET', middlewareSequence: [authMiddleware.isAdmin.bind(authMiddleware), getAllMessagesController.handleGetRequest.bind(getAllMessagesController)]},
            {functionName: 'listPhotosForWeek', method: 'OPTIONS', middlewareSequence: [authMiddleware.isAdmin.bind(authMiddleware), listPhotosForWeekController.handleOptionsRequest.bind(listPhotosForWeekController)]},
            {functionName: 'listPhotosForWeek', method: 'GET', middlewareSequence: [authMiddleware.isAdmin.bind(authMiddleware), listPhotosForWeekController.handleGetRequest.bind(listPhotosForWeekController)]},
        ]);
        console.debug(`${context.functionName} | Rendered ${requestHelper.getRequestData().method} in ${requestHelper.getEnvironment()}. Status code: ${result.statusCode}, body length: ${result.body ? result.body.length : 'null'}`);
        return result;
    } catch (error) {
        console.info(`${requestHelper.getRequestData().method} ${context.functionName} | 500 Server Error: Totally an uncaught error. "${error.message}"`);
        return responseHelper.buildResponse(500, error.message);
    }
}

module.exports.handler = main;