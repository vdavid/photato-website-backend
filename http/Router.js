const RequestHelper = require('./RequestHelper.js');
const ResponseHelper = require('./ResponseHelper.js');

/**
 * @typedef {function(request: RequestHelper, response: ResponseHelper):Promise<ApiGatewayResponse|LambdaEdgeResponse|undefined>} Middleware
 */

/**
 * @typedef {Object} Route
 * @property {string} functionName E.g. "getSignedUrl"
 * @property {string} method E.g. "GET"
 * @property {Middleware[]} middlewareSequence
 */

class Router {
    /**
     * @param {string} appName
     */
    constructor({appName}) {
        this._appName = appName;
    }

    /**
     * Finds the first matching route in the given array, and calls the specified sequence of middleware.
     * If the called sequence does not yield a result, an error will be returned.
     *
     *
     * @param {ApiGatewayEvent|LambdaEdgeEvent} event For formats:
     *        API Gateway: See https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html
     *        Lambda@Edge: See https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html
     * @param {LambdaContext} context See https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
     * @param {Route[]} routes
     * @returns {Promise<ApiGatewayResponse|LambdaEdgeResponse>}
     */
    async resolveRoutes(event, context, routes) {
        const requestHelper = new RequestHelper(event, context);
        const responseHelper = new ResponseHelper(requestHelper.eventSource);

        const environment = requestHelper.getEnvironment();
        if (requestHelper.isEnvironmentValid()) {
            console.debug(`${context.functionName} | Got ${requestHelper.getRequestData().method} request in ${environment}.`);
            const firstMatchedRoute = routes.find(route =>
                this._getFullFunctionName(environment, route.functionName) === context.functionName
                && route.method === requestHelper.getRequestData().method);
            if (firstMatchedRoute) {
                for (const middleware of firstMatchedRoute.middlewareSequence) {
                    const result = await middleware(requestHelper, responseHelper);
                    if (result) {
                        return result;
                    }
                }
                console.info(`${requestHelper.getRequestData().method} ${context.functionName} | 420 error. No output after running ${firstMatchedRoute.middlewareSequence} layer(s) of middleware.`);
                return responseHelper.buildResponse(420, 'Method Failure.');
            } else {
                console.info(`${requestHelper.getRequestData().method} ${context.functionName} | 405 error. No route matched.`, {appName: this._appName, routes});
                return responseHelper.buildResponse(405, 'Method Not Allowed.');

            }
        } else {
            console.info(`${requestHelper.getRequestData().method} ${context.functionName} | 400 error. Invalid environment "${environment}".`);
            return responseHelper.buildResponse(400, 'Wrong environment.');
        }
    }

    /**
     * @param {string} environment E.g. "production"
     * @param {string} bareFunctionName E.g. "getUser"
     * @returns {string} E.g. "photato-website-backend-production-getUser"
     * @private
     */
    _getFullFunctionName(environment, bareFunctionName) {
        return `${this._appName}-${environment}-${bareFunctionName}`;
    }
}

module.exports = Router;