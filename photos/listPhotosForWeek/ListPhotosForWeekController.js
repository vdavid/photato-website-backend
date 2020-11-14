const RequestHelper = require('../../http/RequestHelper.js');
const ResponseHelper = require('../../http/ResponseHelper.js');

class ListPhotosForWeekController {
    /**
     * @param {PhotoRepository} photoRepository For mocking
     */
    constructor({photoRepository}) {
        this._photoRepository = photoRepository;
    }

    /**
     * @param {RequestHelper} requestHelper
     * @param {ResponseHelper} responseHelper
     * @returns {Promise<ApiGatewayResponse|LambdaEdgeResponse>}
     */
    async handleOptionsRequest(requestHelper, responseHelper) {
        return responseHelper.buildOptionsResponse(['GET']);
    }

    /**
     * @param {RequestHelper} requestHelper
     * @param {ResponseHelper} responseHelper
     * @returns {Promise<ApiGatewayResponse|LambdaEdgeResponse>}
     *     The returned data is this, stringified:
     *     {url: string, emailAddress: string, title: string, contentType: string, sizeInBytes: int, lastModifiedDate: Date}[]
     */
    async handleGetRequest(requestHelper, responseHelper) {
        const photosForWeek = await this._photoRepository.listPhotosForWeek(
            requestHelper.getRequestData().arguments['environment'],
            requestHelper.getRequestData().arguments['courseName'],
            parseInt(requestHelper.getRequestData().arguments['weekIndex']));
        console.debug(`ListPhotosForWeekController | handleGetRequest | Got ${photosForWeek.length} messages.`);
        return responseHelper.buildResponse(200, JSON.stringify(photosForWeek), {contentType: 'application/json'});
    }
}

module.exports = ListPhotosForWeekController;