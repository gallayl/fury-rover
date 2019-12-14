import "@furystack/odata-fetchr";
import { Injectable, Injector } from "@furystack/inject";
import { Motor } from "../entity-types/motor";

/**
 * Service class for collection motors
 * File created by @furystack/odata-fetchr
 */
@Injectable({ lifetime: "singleton" })
export class Motors {
  /**
   * Custom action 'stop'
   */
  public stop = (entityId: number) =>
    this.getService().execCustomAction("stop", entityId);
  /**
   * Custom action 'getValue'
   */
  public getValue = (entityId: number) =>
    this.getService().execCustomFunction<unknown>("getValue", entityId);
  /**
   * Custom collection action 'stopAll'
   */
  public stopAll = () =>
    this.getService().execCustomCollectionAction("stopAll");
  /**
   * Custom collection action 'getAllValue'
   */
  public getAllValue = () =>
    this.getService().execCustomCollectionFunction<unknown>("getAllValue");

  /**
   * Custom action 'stop'
   */
  public set4 = (values: [number, number, number, number]) =>
    this.getService().execCustomCollectionAction("set4", {
      values
    });

  public readonly entitySetUrl = "motors";
  public getService = () => this.injector.getOdataServiceFor(Motor, "motors");
  constructor(private injector: Injector) {}
}
