"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fs_1 = __importDefault(require("fs"));
aws_sdk_1.default.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
const s3 = new aws_sdk_1.default.S3();
class FileStorageService {
    async uploadFile(file, keyPrefix) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `${keyPrefix}/${Date.now()}-${file[0].originalname}`,
            Body: fs_1.default.createReadStream(file[0].path),
            ContentType: file[0].mimetype,
            ACL: 'public-read',
        };
        const data = await s3.upload(params).promise();
        return data.Location;
    }
}
exports.default = FileStorageService;
