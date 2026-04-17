/// <reference path="../.astro/types.d.ts" />
/// <reference types="@cloudflare/workers-types" />

declare module "cloudflare:workers" {
  interface CloudflareEnv {
    COURSE_BUCKET: R2Bucket;
    EMAIL: SendEmail;
  }
}
