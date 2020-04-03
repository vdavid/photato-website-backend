const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-east-1', signatureVersion: 'v4' });

exports.handler = async (event) => {
    const data = await s3.getObject({
        Bucket: 'photato-image-uploads',
        Key: event.queryStringParameters.key,
    });
    return {
        status: 200,
        headers: {
            my_header: 'my_value'
        },
        body: JSON.stringify(data),
        isBase64Encoded: false,
    };
};

