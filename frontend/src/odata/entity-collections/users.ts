import "@furystack/odata-fetchr";
import { Injectable, Injector } from "@furystack/inject";
import { User } from "../entity-types/user";

/**
 * Service class for collection users
 * File created by @furystack/odata-fetchr
 */
@Injectable({ lifetime: "transient" })
export class Users {
  public readonly entitySetUrl = "users";
  public getService = () => this.injector.getOdataServiceFor(User, "users");
  constructor(private injector: Injector) {}
}
