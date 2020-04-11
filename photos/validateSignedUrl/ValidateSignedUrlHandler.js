module.exports = class ValidateSignedUrlHandler {
    /**
     * @param {SignatureRepository} signatureRepository
     */
    constructor({signatureRepository}) {
        /** @type {SignatureRepository} */
        this._signatureRepository = signatureRepository;
    }

    /**
     * Handles Lambda@Edge inputs
     *
     * @param {Object} event See for format: https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html
     * @returns {Object}
     */
    async handleRequest(event) {
        const request = event.Records[0].cf.request;
        const path = request.uri + '?' + request.querystring;

        if ((request.method === 'OPTIONS') && await this._signatureRepository.isSignatureValidForPath(path)) {
            return {
                status: '200',
                statusDescription: 'OK',
                headers: {
                    'access-control-allow-origin': [{key: 'Access-Control-Allow-Origin', value: '*'}],
                    'access-control-allow-methods': [{key: 'Access-Control-Allow-Methods', value: 'PUT'}],
                    'access-control-allow-headers': [{key: 'Access-Control-Allow-Headers', value: '*'}],
                },
            };
        } else if ((request.method === 'PUT') && await this._signatureRepository.isSignatureValidForPath(path)) {
            await this._signatureRepository.markSignatureExpiredForPath(path);
            return request;
        } else {
            return {
                status: '403',
                statusDescription: 'Forbidden',
                headers: {
                    'content-type': [{key: 'Content-Type', value: 'text/plain'}],
                    'content-encoding': [{key: 'Content-Encoding', value: 'UTF-8'}],
                    'access-control-allow-origin': [{key: 'Access-Control-Allow-Origin', value: '*'}],
                },
                body: 'You cannot upload your stuff here, sorry.',
            };
        }
    }
};