import { OdataService } from "@furystack/odata-fetchr/dist/odata-service";
import { Motor } from "../entity-types/motor";

/**
 * Service class for collection motors
 */
export class Motors extends OdataService<Motor> {
  protected entitySetUrl = "motors";
}
