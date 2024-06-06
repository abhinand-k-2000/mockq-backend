import  IFileStorageService  from "../../interface/utils/IFileStorageService";
import AWS from "aws-sdk";
import fs from "fs"



AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  
  const s3 = new AWS.S3();


class FileStorageService implements IFileStorageService {
    async uploadFile(file: any, keyPrefix: string): Promise<string> {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `${keyPrefix}/${Date.now()}-${file[0].originalname}`,
            Body: fs.createReadStream(file[0].path),
            ContentType: file[0].mimetype,
            ACL: 'public-read',
        };
          const data = await s3.upload(params).promise();
          return data.Location;
    }
}


export default FileStorageService