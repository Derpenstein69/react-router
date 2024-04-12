import {
  TextEncoder as NodeTextEncoder,
  TextDecoder as NodeTextDecoder,
} from "util";
import { AbortController as NodeAbortController } from "abort-controller";

// https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#configuring-your-testing-environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

if (!globalThis.fetch) {
  const { TextDecoder, TextEncoder } = require("node:util");
  global.TextDecoder = TextDecoder;
  global.TextEncoder = TextEncoder;

  const { ReadableStream, WritableStream } = require("node:stream/web");
  global.ReadableStream = ReadableStream;
  global.WritableStream = WritableStream;

  const { fetch, FormData, Request, Response, Headers } = require("undici");

  globalThis.fetch = fetch;
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.Headers = Headers;

  global.FormData = global.FormData || FormData;
}

if (!globalThis.AbortController) {
  // @ts-expect-error
  globalThis.AbortController = NodeAbortController;
}

if (!globalThis.TextEncoder || !globalThis.TextDecoder) {
  globalThis.TextEncoder = NodeTextEncoder;
  // @ts-expect-error
  globalThis.TextDecoder = NodeTextDecoder;
}
