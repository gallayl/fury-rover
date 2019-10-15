import { Injectable, Injector } from "@furystack/inject";

export interface OdataClientOptions {
  url: string;
  fetch?: typeof window.fetch;
}

@Injectable({ lifetime: "singleton" })
export class OdataClient {
  constructor(public readonly options: OdataClientOptions) {}
}

declare module "@furystack/inject/dist/Injector" {
  interface Injector {
    useOdata: (params: OdataClientOptions) => Injector;
    getOdataClient: () => OdataClient;
  }
}

Injector.prototype.useOdata = function(params) {
  this.setExplicitInstance(new OdataClient({ ...params }));
  this.getOdataClient = () => this.getInstance(OdataClient);
  return this;
};
