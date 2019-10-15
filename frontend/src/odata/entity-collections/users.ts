import { OdataService } from "@furystack/odata-fetchr/dist/odata-service";
import { User } from "../entity-types/user";

/**
 * Service class for collection users
 */
export class Users extends OdataService<User> {
  protected entitySetUrl = "users";
}
