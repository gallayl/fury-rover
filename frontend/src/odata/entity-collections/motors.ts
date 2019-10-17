import "@furystack/odata-fetchr";
import { Injectable, Injector } from "@furystack/inject";
import { Motor } from "../entity-types/motor";

/**
 * Service class for collection motors
 * File created by @furystack/odata-fetchr
 */
@Injectable({ lifetime: "transient" })
export class Motors {
  public readonly entitySetUrl = "motors";
  public getService = () => this.injector.getOdataServiceFor(Motor, "motors");
  constructor(private injector: Injector) {}
}
