'use strict';

/**
 * Module dependencies
 */

/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
// Public node modules.
const { URL } = require('url');
const MinioSDK = require('minio');

module.exports = {
    provider: 'strapi-idc-minio',
    name: 'IDC Minio Server - split external domain from internal minio host',
    auth: {
        public: {
            label: 'Access API Token',
            type: 'text'
        },
        private: {
            label: 'Secret Access Token',
            type: 'text'
        },
        bucket: {
            label: 'Bucket',
            type: 'text'
        },
        // -- Extend plugin to include a directory PATH, for kong rules. D.Hallwood
        prefix: {
            label: "Key Prefix, e.g. content/",
            type: 'text'
        },
        // -- Minio Server
        endpoint: {
            label: 'Endpoint (Internal minio_point) e.g. http://idc_minio_gw:9000',
            type: 'text'
        },
        // -- Extend to have an external URL files will be hit with. D.Hallwood
        baseUrl: {
            label: 'Base URL (External Site) , e.g. https://xxx.includelxp.com',
            type: 'text'
        },
    },
    init: (config) => {
        // -- IDC Minio bucket connection
        const endPoint = new URL(config.endpoint);
        const useSSL = endPoint.protocol && endPoint.protocol === 'https:';

        const Minio = new MinioSDK.Client({
            endPoint: endPoint.hostname,
            port: parseInt(endPoint.port) || (useSSL ? 443 : 80),
            useSSL: useSSL,
            accessKey: config.public,
            secretKey: config.private
        });

        return {
            upload: (file) => {
                return new Promise((resolve, reject) => {

                    // -- Extend to make use of a directory PATH inside minio/S3-Buckets D.Hallwood
                    const prefix = config.prefix.trim() === "/" ? "" : config.prefix.trim();
                    const path = file.path ? `${file.path}/` : '';
                    const filename = `${prefix}${path}${file.hash}${file.ext}`;

                    const buffer = new Buffer(file.buffer, 'binary');

                    Minio.putObject(config.bucket, filename, buffer, (err, tag) => {
                        if(err) {
                            reject(err);
                        }

                        //  -- this is the minio internal path -- we don't want this, public cant use this
                        // file.url = `${Minio.protocol}//${Minio.host}:${Minio.port}/${config.bucket}/${filename}`;

                        // -- set a different link to be returned in API results, absolute or relative. D.Hallwood
                        // file.url = `${config.baseUrl}/${filename}`; // absolute
                        file.url = `/${filename}` // relative

                        resolve();
                    });
                });
            },
            delete: (file) => {
                return new Promise((resolve, reject) => {
                    const filename = (file.path ? `${file.path}.` : '') + `${file.hash}${file.ext}`;

                    Minio.removeObject(config.bucket, filename, (err) => {
                        if(err) {
                            reject(err);
                        }

                        resolve();
                    });
                });
            }
        };
    }
};
