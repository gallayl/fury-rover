/** ToDo: Main entry point */
import { PathHelper } from "@sensenet/client-utils";
import { createComponent, shadeInjector } from "@furystack/shades";
import { VerboseConsoleLogger } from "@furystack/logging";
import { Layout } from "./components/layout";
import "@furystack/odata-fetchr";
import { Motors } from "./odata/entity-collections";

export const environmentOptions = {
  nodeEnv: process.env.NODE_ENV as "development" | "production",
  debug: Boolean(process.env.DEBUG),
  appVersion: process.env.APP_VERSION as string,
  buildDate: new Date(process.env.BUILD_DATE as string),
  serviceUrl: process.env.SERVICE_URL as string
};

shadeInjector.useOdata({
  serviceEndpoint: PathHelper.joinPaths(environmentOptions.serviceUrl, "odata"),
  defaultInit: {}
});

const motors = shadeInjector.getInstance(Motors).getService();

motors
  .query()
  .exec()
  .then(m => console.log("Motors:", m.value.map(motor => motor)));

shadeInjector.useLogging(VerboseConsoleLogger);

shadeInjector.logger.withScope("Startup").verbose({
  message: "Initializing Shade Frontend...",
  data: { environmentOptions }
});

const root: HTMLDivElement = document.getElementById("root") as HTMLDivElement;
root.appendChild(<Layout />);
