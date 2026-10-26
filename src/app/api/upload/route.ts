import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { getCurrentAdmin } from "@/lib/auth";
import { isStorageConfigured, siteUrl } from "@/lib/config";

export const runtime = "nodejs";
const MAX_BYTES = 5 * 1024 * 1024;
export async function POST(request: Request) {
  if (!await getCurrentAdmin()) return Response.json({ error:"ავტორიზაცია აუცილებელია." },{status:401});
  // Next.js may normalize request.url to an internal hostname behind a proxy.
  const allowedOrigin = new URL(process.env.BETTER_AUTH_URL || siteUrl()).origin;
  if (request.headers.get("origin") !== allowedOrigin) return Response.json({ error:"მოთხოვნის წყარო არასწორია." },{status:403});
  if (!isStorageConfigured()) return Response.json({ error:"ჯერ საჭიროა Cloudflare R2-ის დაკავშირება." },{status:503});
  const length = Number(request.headers.get("content-length"));
  if (!length || length > MAX_BYTES + 65536) return Response.json({ error:"მაქსიმალური ზომაა 5 მბ." },{status:413});
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_BYTES || !["image/jpeg","image/png","image/webp","image/avif"].includes(file.type)) return Response.json({error:"აირჩიეთ JPG, PNG, WebP ან AVIF სურათი (5 მბ-მდე)."},{status:400});
    const input = Buffer.from(await file.arrayBuffer());
    const pipeline = sharp(input,{limitInputPixels:40_000_000,animated:false});
    const metadata = await pipeline.metadata();
    if (!["jpeg","png","webp","avif","heif"].includes(metadata.format || "")) return Response.json({error:"ფაილი მხარდაჭერილი სურათი არ არის."},{status:400});
    const image = await pipeline.rotate().resize(2400,2400,{fit:"inside",withoutEnlargement:true}).webp({quality:85}).toBuffer();
    const key = `gng/${new Date().toISOString().slice(0,7)}/${randomUUID()}.webp`;
    const storage = new S3Client({
      region:"auto",endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials:{accessKeyId:process.env.R2_ACCESS_KEY_ID!,secretAccessKey:process.env.R2_SECRET_ACCESS_KEY!},
    });
    await storage.send(new PutObjectCommand({ Bucket:process.env.R2_BUCKET_NAME!,Key:key,Body:image,ContentType:"image/webp",CacheControl:"public, max-age=31536000, immutable" }));
    const url = `${process.env.R2_PUBLIC_URL!.replace(/\/$/,"")}/${key}`;
    return Response.json({url});
  } catch {
    return Response.json({error:"ატვირთვა ვერ მოხერხდა. შეამოწმეთ სურათი და R2-ის პარამეტრები."},{status:400});
  }
}
