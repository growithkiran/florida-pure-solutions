import homeHtml from '../website-source/dist/index.html?raw';
import testingHtml from '../website-source/dist/water-testing/index.html?raw';
import wholeHomeHtml from '../website-source/dist/whole-house-water-filtration/index.html?raw';
import drinkingHtml from '../website-source/dist/reverse-osmosis-systems/index.html?raw';
import careHtml from '../website-source/dist/filter-replacement/index.html?raw';

const websitePages: Record<string, string> = {
  '/': homeHtml,
  '/water-testing/': testingHtml,
  '/whole-house-water-filtration/': wholeHomeHtml,
  '/reverse-osmosis-systems/': drinkingHtml,
  '/filter-replacement/': careHtml,
};

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const route = url.pathname.replace(/index\.html$/, '');
      const canonical = route.endsWith('/') ? route : `${route}/`;
      const page = websitePages[canonical];
      if (page && (request.method === 'GET' || request.method === 'HEAD')) {
        if (!route.endsWith('/')) {
          url.pathname = canonical;
          return Response.redirect(url, 308);
        }
        return new Response(request.method === 'HEAD' ? null : page, {
          headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex, nofollow' },
        });
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
