import { PassThrough } from "stream";
// @ts-ignore
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "remix";
import type { EntryContext } from "remix";
import { Response, Headers } from "@remix-run/node";

import { DataloaderProvider } from "./dataloader/lib";
import { createServerDataloader } from "./dataloader/server";

let ABORT_DELAY = 10000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let dataloader = createServerDataloader(remixContext, request, {}, {});

  return new Promise((resolve) => {
    let didError = false;
    const { pipe, abort } = renderToPipeableStream(
      <DataloaderProvider dataloader={dataloader}>
        <RemixServer context={remixContext} url={request.url} />
      </DataloaderProvider>,
      {
        onShellReady() {
          let body = new PassThrough();
          pipe(body);

          responseHeaders.set("Content-Type", "text/html; charset=UTF-8");
          responseHeaders.set("Transfer-Encoding", "chunked");

          resolve(
            new Response(body, {
              status: didError ? 500 : responseStatusCode,
              headers: responseHeaders,
            })
          );
        },
        onError(error: Error) {
          didError = true;
          console.error(error);
        },
      }
    );
    // Abandon and switch to client rendering if enough time passes.
    // Try lowering this to see the client recover.
    setTimeout(abort, ABORT_DELAY);
  });
}
