/* Requires */
const GetSignedUrlHandler = require('./GetSignedUrlHandler.js');
const PhotoMetadataBuilder = require('../PhotoMetadataBuilder.js');
const PhotoRepository = require('../PhotoRepository.js');
const SignatureRepository = require('../SignatureRepository.js');

/* Constants */
const bucketName = 'testBucket';
const fakeQueryString = 'a=1';
const testEmailAddress = 'test@user.com';
const testBearerToken = 'testToken';

/* S3 mock */
const getSignedUrlMock = jest.fn((operation, {Bucket: bucket, Key: key}) =>
    'https://' + bucket + '/' + key + '?' + fakeQueryString);
const putObjectMock = jest.fn(() => ({promise: async () => true}));
const s3 = {
    getSignedUrl: getSignedUrlMock,
    putObject: putObjectMock,
};

/* External objects */
const photoMetadataBuilder = new PhotoMetadataBuilder();
const photoRepository = new PhotoRepository(s3, bucketName);
const signatureRepository = new SignatureRepository(s3, bucketName);
const getSignedUrlHandler = new GetSignedUrlHandler({photoMetadataBuilder, photoRepository, signatureRepository});

function _convertToQueryString(object) {
    return Object.keys(object).map(key => key + '=' + object[key]).join('&');
}

test('Handles valid requests well', async () => {
    /* Arrange */
    const host = 'temp.cloudfront.net';
    const parameters = {
        environment: 'development',
        emailAddress: testEmailAddress,
        courseName: 'hu-3',
        weekIndex: '2',
        originalFileName: 'kukutyin.jpg',
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
                                {key: 'Authorization', value: 'Bearer ' + testBearerToken},
                            ]
                        },
                        method: 'GET',
                        querystring: _convertToQueryString(parameters),
                        uri: '/',
                    },
                },
            },
        ],
    };

    /*Act */
    const response = await getSignedUrlHandler.handleRequest(event, {}, {email: testEmailAddress});

    /* Assert */
    expect(response.body).toEqual('https://' + host + '/development/photos/' + parameters.courseName + '/'
        + 'week-' + parameters.weekIndex + '/' + parameters.emailAddress + '.jpg'
        + '?' + fakeQueryString);
    expect(response.status).toEqual(200);
    expect(response.statusDescription).toEqual('OK');
    expect(response.statusDescription).toEqual('OK');
    expect(getSignedUrlMock).toBeCalledTimes(1);
    expect(getSignedUrlMock.mock.calls[0][0]).toBe('putObject');
    expect(putObjectMock).toBeCalledTimes(1);
    expect(putObjectMock.mock.calls[0][0].Bucket).toBe(bucketName);
    expect(putObjectMock.mock.calls[0][0].Key).toBe('signatures/valid/6c311f0e5c17eb06d08cd1bc313a0bc1b892bb18dc8e69c15a42b5dbf6620b06');
});
