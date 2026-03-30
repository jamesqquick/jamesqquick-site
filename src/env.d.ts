/// <reference path="../.astro/types.d.ts" />
/// <reference types="@cloudflare/workers-types" />

type Runtime = import("@astrojs/cloudflare").Runtime<{
  COURSE_BUCKET: R2Bucket;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
