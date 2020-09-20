import { Injectable, Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'
import Semaphore from 'semaphore-async-await'
import { Constants } from 'common'
import { open, pwmSetData, write, PWM, OUTPUT, LOW, HIGH, init } from 'rpio'

/**
 * Service class for Adafruit Motor HAT
 */
@Injectable({ lifetime: 'singleton' })
export class MotorService {
  writeLock = new Semaphore(1)

  private readonly logger: ScopedLogger

  private async initPins() {
    try {
      await this.writeLock.acquire()
      // init({mapping: 'gpio'});
      init({ gpiomem: false })
      // PWMs
      open(8, PWM)
      open(13, PWM)
      open(2, PWM)
      open(7, PWM)

      // Outputs
      open(9, OUTPUT)
      open(10, OUTPUT)
      open(11, OUTPUT)
      open(12, OUTPUT)
      open(3, OUTPUT)
      open(4, OUTPUT)
      open(5, OUTPUT)
      open(6, OUTPUT)
    } catch (error) {
      this.logger.warning({
        message: 'Failed to init RPIO',
        data: { error: { message: error.message, stack: error.stack } },
      })
    } finally {
      this.writeLock.release()
    }
  }

  private getMotorPins(channel: Constants.MotorChannel) {
    switch (channel) {
      case 0:
        return {
          Pwm: 8,
          Pin2: 9,
          Pin1: 10,
        }
      case 1:
        return {
          Pwm: 13,
          Pin2: 12,
          Pin1: 11,
        }
      case 2:
        return {
          Pwm: 2,
          Pin2: 3,
          Pin1: 4,
        }
      case 3:
        return {
          Pwm: 7,
          Pin2: 6,
          Pin1: 5,
        }
      default:
        throw new Error('The Motor Channel argument has to be between 0-3')
    }
  }

  public setDirection(channel: Constants.MotorChannel, dir: Constants.Direction) {
    const pins = this.getMotorPins(channel)
    switch (dir) {
      case 'forward':
        write(pins.Pin2, LOW)
        write(pins.Pin1, HIGH)
        break
      case 'back':
        write(pins.Pin1, LOW)
        write(pins.Pin2, HIGH)
        break
      case 'release':
        write(pins.Pin1, LOW)
        write(pins.Pin2, LOW)
        break
      default:
        throw new Error('Direction not recognized')
    }
  }

  public setSpeed(channel: Constants.MotorChannel, speed: number) {
    const pins = this.getMotorPins(channel)
    pwmSetData(pins.Pwm, speed)
  }

  public stopAll() {
    ;([0, 1, 2, 3] as const).map((motor) => {
      this.setDirection(motor, 'release')
      this.setSpeed(motor, 0)
    })
  }

  constructor(injector: Injector) {
    this.logger = injector.logger.withScope('@fury-rover/motor-service')
    this.logger.verbose({
      message: `Initializing MotorService...`,
    })
    this.initPins()
  }
}
