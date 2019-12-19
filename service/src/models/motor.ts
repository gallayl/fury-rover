/**
 * Model class for DC TT motors
 */
export class Motor {
  /**
   * channel between 1-4
   */
  public id!: number

  /**
   * Torque value between -1 and 1 (0 is off)
   */
  public value!: number

  /**
   * is rotation value reversed
   */
  public isReversed?: boolean

  /**
   * multiplier
   */
  public multiplier?: number
}
