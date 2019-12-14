import { Injectable, Injector } from "@furystack/inject";
import { DataSet, Repository } from "@furystack/repository";
import { Motor } from "../models/motor";

/**
 * Options model for movement controls
 */
export interface MovementOptions {
  /**
   * Sensitivity multiplier for front motors
   */
  frontSensitivity: number;

  /**
   * Sensitivity multiplier for back motors
   */
  backSensitivity: number;

  /**
   * Steering sensitivity multiplier
   */
  steerSensitivity: number;
}

/**
 * Service for movement control
 */
@Injectable({ lifetime: "transient" })
export class MovementService {
  public readonly options: MovementOptions = {
    frontSensitivity: 0.5,
    backSensitivity: 1,
    steerSensitivity: 1
  };

  public async stop() {
    await Promise.all([
      this.dataSet.update(this.injector, 0, ({ value: 0 } as any) as Motor),
      this.dataSet.update(this.injector, 1, ({ value: 0 } as any) as Motor),
      this.dataSet.update(this.injector, 2, ({ value: 0 } as any) as Motor),
      this.dataSet.update(this.injector, 3, ({ value: 0 } as any) as Motor)
    ]);
  }
  public async go(throttle: number, steer = 0) {
    const effectiveSteer = steer * this.options.steerSensitivity;
    const effectiveFrontThrottle = throttle * this.options.frontSensitivity;
    const effectiveBackThrottle = throttle * this.options.backSensitivity;

    const frontLeft = effectiveFrontThrottle + effectiveSteer;
    const backLeft = effectiveBackThrottle + effectiveSteer;
    const frontRight = -effectiveFrontThrottle + effectiveSteer;
    const backRight = -effectiveBackThrottle + effectiveSteer;

    await Promise.all([
      this.dataSet.update(this.injector, 0, ({
        value: frontLeft
      } as any) as Motor),
      this.dataSet.update(this.injector, 1, ({
        value: backLeft
      } as any) as Motor),
      this.dataSet.update(this.injector, 2, ({
        value: frontRight
      } as any) as Motor),
      this.dataSet.update(this.injector, 3, ({
        value: backRight
      } as any) as Motor)
    ]);

    return { frontLeft, backLeft, frontRight, backRight };
  }

  public setup(options: Partial<MovementOptions>) {
    Object.assign(this.options, options);
  }

  private readonly dataSet: DataSet<Motor>;

  constructor(private repo: Repository, private readonly injector: Injector) {
    this.dataSet = this.repo.getDataSetFor<Motor>("motors");
  }
}
