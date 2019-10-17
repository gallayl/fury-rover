import "@furystack/odata-fetchr";
import { Injectable, Injector } from "@furystack/inject";
import { Motor } from "../entity-types/motor";

/**
 * Service class for collection motors
 * File created by @furystack/odata-fetchr
 */
@Injectable({ lifetime: "transient" })
export class Motors {
  /**
   * Custom action 'stop'
   */
  public stop = (entityId: number, params: any /** todo */) =>
    this.getService().execCustomAction("stop", entityId, params);
  /**
   * Custom action 'getValue'
   */
  public getValue = (entityId: number) =>
    this.getService().execCustomFunction("getValue", entityId);
  /**
   * Custom collection action 'stopAll'
   */
  public stopAll = (params: any) =>
    this.getService().execCustomCollectionAction("stopAll", params);
  /**
   * Custom collection action 'getAllValue'
   */
  public getAllValue = () =>
    this.getService().execCustomCollectionFunction("getAllValue");
  public readonly entitySetUrl = "motors";
  public getService = () => this.injector.getOdataServiceFor(Motor, "motors");
  constructor(private injector: Injector) {}
}
