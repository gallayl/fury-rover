import { parse } from "url";
import { RouteModel } from "@furystack/http-api";
import { GetSystemLoadAction } from "./actions/get-system-load";
import { GetSystemDetailsAction } from "./actions/get-system-details";
import { StreamVideoAction } from "./actions/stream-video";
import { GetReleaseInfoAction } from "./actions/get-release-info";
import { WakeOnLanAction } from "./actions/wake-on-lan";

export const routing: RouteModel = injector => {
  // Moved stuff to OData

  const msg = injector.getRequest();

  const urlPathName = parse(msg.url || "", true).pathname;

  /**
   * GET Requests section.
   */
  if (msg.method === "GET") {
    switch (urlPathName) {
      case "/getSystemLoad":
        return GetSystemLoadAction;
      case "/getSystemDetails":
        return GetSystemDetailsAction;
      case "/video":
        return StreamVideoAction;
      case "/releaseInfo":
        return GetReleaseInfoAction;
      default:
        break;
    }
  }

  /**
   * POST requests section
   */
  if (msg.method === "POST") {
    switch (urlPathName) {
      case "/wake":
        return WakeOnLanAction;
      default:
        break;
    }
  }
  return undefined;
};
