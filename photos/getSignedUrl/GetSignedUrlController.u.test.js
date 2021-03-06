/* Requires */
const RequestHelper = require('../../http/RequestHelper.js');
const ResponseHelper = require('../../http/ResponseHelper.js');
const {eventSources} = require('../../http/eventSources.js');

const PhotoMetadataBuilder = require('../PhotoMetadataBuilder.js');
const PhotoRepository = require('../PhotoRepository.js');
const SignatureRepository = require('../SignatureRepository.js');
const GetSignedUrlController = require('./GetSignedUrlController.js');

/* Constants */
const bucketName = 'testBucket';
const fakeResponseQueryString = 'a=1';
const testEmailAddress = 'test@user.com';
const testBearerToken = 'testToken';

/* S3 mock */
const getSignedUrlMock = jest.fn((operation, {Bucket: bucket, Key: key}) =>
    'https://' + bucket + '/' + key + '?' + fakeResponseQueryString);
const putObjectMock = jest.fn(() => ({promise: async () => true}));
const s3Mock = {
    getSignedUrl: getSignedUrlMock,
    putObject: putObjectMock,
};

/* External objects */
const photoMetadataBuilder = new PhotoMetadataBuilder();
// noinspection JSCheckFunctionSignatures
const photoRepository = new PhotoRepository(s3Mock, bucketName);
// noinspection JSCheckFunctionSignatures
const signatureRepository = new SignatureRepository(s3Mock, bucketName);
const getSignedUrlController = new GetSignedUrlController({photoMetadataBuilder, photoRepository, signatureRepository});

function _convertToQueryString(object) {
    return Object.keys(object).map(key => key + '=' + object[key]).join('&');
}

test('Handles valid OPTIONS requests well', async () => {
    /* Arrange */
    const host = 'temp.cloudfront.net';
    const event = {
        Records: [
            {
                cf: {
                    request: {
                        headers: {
                            host: [
                                {key: 'Host', value: host},
                            ],
                        },
                        method: 'OPTIONS',
                        uri: '/get-signed-url',
                    },
                },
            },
        ],
    };
    // noinspection JSCheckFunctionSignatures
    const requestHelper = new RequestHelper(event, {});
    const responseHelper = new ResponseHelper(eventSources.LambdaEdge)

    /* Act */
    const response = await getSignedUrlController.handleOptionsRequest(requestHelper, responseHelper);

    /* Assert */
    expect(response.status).toEqual(200);
    expect(response.statusDescription).toEqual('OK');
    expect(getSignedUrlMock).toBeCalledTimes(0);
    expect(putObjectMock).toBeCalledTimes(0);
});

test('Handles valid GET requests well', async () => {
    /* Arrange */
    const host = 'temp.cloudfront.net';
    const parameters = {
        environment: 'development',
        emailAddress: testEmailAddress,
        courseName: 'hu-3',
        weekIndex: '2',
        originalFileName: 'test-pic.jpg',
        title: 'Test title',
        mimeType: 'image/jpeg',
    };
    const event = {
        Records: [
            {
                cf: {
                    request: {
                        headers: {
                            host: [
                                {key: 'Host', value: host},
                            ],
                            authorization: [
                                {key: 'Authorization', value: 'Bearer ' + testBearerToken},
                            ],
                        },
                        method: 'GET',
                        querystring: _convertToQueryString(parameters),
                        uri: '/get-signed-url',
                    },
                },
            },
        ],
    };

    /* Act */
    // noinspection JSCheckFunctionSignatures
    const requestHelper = new RequestHelper(event, {});
    // noinspection JSCheckFunctionSignatures
    requestHelper.setUser({emailAddress: testEmailAddress});
    const responseHelper = new ResponseHelper(eventSources.LambdaEdge)
    const response = await getSignedUrlController.handleGetRequest(requestHelper, responseHelper);

    /* Assert */
    expect(response.body).toEqual('https://' + host + '/development/photos/' + parameters.courseName + '/'
        + 'week-' + parameters.weekIndex + '/' + parameters.emailAddress + '.jpg'
        + '?' + fakeResponseQueryString);
    expect(response.status).toEqual(200);
    expect(response.statusDescription).toEqual('OK');
    expect(getSignedUrlMock).toBeCalledTimes(1);
    expect(getSignedUrlMock.mock.calls[0][0]).toBe('putObject');
    expect(putObjectMock).toBeCalledTimes(1);
    expect(putObjectMock.mock.calls[0][0].Bucket).toBe(bucketName);
    expect(putObjectMock.mock.calls[0][0].Key).toBe('signatures/valid/6c311f0e5c17eb06d08cd1bc313a0bc1b892bb18dc8e69c15a42b5dbf6620b06');
});
