import { OdataService } from "@furystack/odata-fetchr/dist/odata-service";
import { Servo } from "../entity-types/servo";

/**
 * Service class for collection servos
 */
export class Servos extends OdataService<Servo> {
  protected entitySetUrl = "servos";
}
