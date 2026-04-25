import { S3Client } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config();

export const r2 = new S3Client({
  region: "auto", 
  endpoint: process.env.R2_ENDPOINT_URL!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// async function testConnection() {
//     console.log("Access Key exists:", !!process.env.R2_ACCESS_KEY_ID);
//     console.log("Secret Key exists:", !!process.env.R2_SECRET_ACCESS_KEY);
//     console.log("Endpoint:", process.env.R2_ENDPOINT_URL);
//     console.log("Testing bucket:", process.env.R2_BUCKET_NAME);
//     try {
//         await r2.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET_NAME! }));
//         console.log(`✅ Success! Connected to R2 bucket "${process.env.R2_BUCKET_NAME}".`);
//     } catch (e: any) {
//         console.error("❌ Connection Failed!");
//         console.error("Error Code:", e.Code || e.name);
//         console.error("Error Message:", e.message);
//     }
// }
// testConnection();