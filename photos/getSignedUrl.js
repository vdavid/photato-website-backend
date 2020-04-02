const AWS = require('aws-sdk');
const config = require('../config.json');
const GetSignedUrlHandler = require('./GetSignedUrlHandler.js');
const PhotoMetadataBuilder = require('./PhotoMetadataBuilder.js');
const PhotoRepository = require('./PhotoRepository.js');
const SignatureRepository = require('./SignatureRepository.js');

module.exports.handler = async (event, context) => {
    const photoMetadataBuilder = new PhotoMetadataBuilder();
    const s3 = new AWS.S3();
    const photoRepository = new PhotoRepository(s3, config.bucket.name);
    const signatureRepository = new SignatureRepository(s3, config.bucket.name);

    const handler = new GetSignedUrlHandler({photoMetadataBuilder, photoRepository, signatureRepository});
    return handler.handleRequest(event, context);
};