import { join } from 'path'
import { Injectable, Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'
import Semaphore from 'semaphore-async-await'

import { Direction, Motor, MotorHat, Servo } from 'motor-hat'
import { Constants } from 'common'

/**
 * Service class for Adafruit Motor HAT
 */
@Injectable({ lifetime: 'singleton' })
export class MotorService {
  writeLock = new Semaphore(1)

  public async setMotorValue(motor: keyof typeof Constants.MOTORS, direction: Direction, speedPercent: number) {
    try {
      await this.writeLock.acquire()
      const motorIndex = Object.keys(Constants.MOTORS).indexOf(motor as any)
      await new Promise((resolve, reject) => {
        this.hat.dcs[motorIndex].setSpeed(speedPercent, (err) => {
          err
            ? reject(err)
            : this.hat.dcs[motorIndex].run(direction, (err2) => {
                err2 ? reject(err2) : resolve()
              })
        })
      })
    } finally {
      this.writeLock.release()
    }
  }
  public async stopAll() {
    try {
      await this.writeLock.acquire()
      await Promise.all(
        this.hat.dcs.map(
          async (m) =>
            await new Promise((resolve, reject) =>
              m.stop((err) => {
                err ? reject(err) : resolve()
              }),
            ),
        ),
      )
    } finally {
      this.writeLock.release()
    }
  }

  public async setServos(servoValues: Array<{ servo: keyof typeof Constants.SERVOS; percent: number }>) {
    try {
      await this.writeLock.acquire()
      servoValues.forEach(({ servo, percent }) => {
        const servoIndex = Object.keys(Constants.SERVOS).indexOf(servo)
        this.hat.servos[servoIndex].moveTo(percent)
      })
    } finally {
      this.writeLock.release()
    }
  }

  public async calibrateServo(
    servo: keyof typeof Constants.SERVOS,
    freq: number,
    min: number,
    max: number,
    percent: number,
  ) {
    try {
      await this.writeLock.acquire()
      const servoIndex = Object.keys(Constants.SERVOS).indexOf(servo)
      this.hat.servos[servoIndex].calibrate(freq, min, max)
      this.hat.servos[servoIndex].moveTo(percent)
    } finally {
      this.writeLock.release()
    }
  }

  private readonly logger: ScopedLogger

  private hat!: MotorHat

  private async initHat() {
    try {
      await this.writeLock.acquire()
      this.hat = (await import('motor-hat'))
        .default({
          address: 0x6f,
          dcs: Object.values(Constants.MOTORS) as Motor[],
          servos: Object.values(Constants.SERVOS),
        })
        .init()

      Object.entries(Constants.SERVOS).map(([key, value]) => {
        const calibration = Constants.SERVO_CALIBRATION[key as keyof typeof Constants.SERVO_CALIBRATION]
        this.hat.servos[value].calibrate(60, calibration.minPulse, calibration.maxPulse)
      })
    } catch (error) {
      this.logger.warning({ message: 'Failed to init Motor HAT, using a mocked one', data: { error } })
      const syncMock = () => ({})
      this.hat = ({
        dcs: Object.entries(Constants.MOTORS).map(() => ({
          init: () => ({} as any),
          runSync: syncMock,
          setSpeedSync: syncMock,
          setFrequencySync: syncMock,
          setFrequency: (_freq: number, cb: () => void) => cb(),
          stopSync: syncMock,
          stop: (cb: () => void) => cb(),
          setSpeed: (_speed: number, cb: () => void) => cb(),
          run: (_dir: number, cb: () => void) => cb(),
        })),
        servos: Object.entries(Constants.SERVOS).map<Servo>(() => ({
          calibrate: () => ({}),
          moveTo: () => ({}),
        })),
      } as any) as MotorHat
    } finally {
      this.writeLock.release()
    }
  }

  constructor(injector: Injector) {
    this.logger = injector.logger.withScope('@furystack-quad/PythonMotorService')
    const path = join(__filename, '..', '..', '..', 'MotorService.py')
    this.logger.verbose({
      message: `Spawning Python process with file ${path}`,
    })

    this.initHat()
  }
}
