import { Injectable, Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'
import Semaphore from 'semaphore-async-await'
import { i2cBegin, i2cSetSlaveAddress, i2cWrite, i2cRead } from 'rpio'
import { sleepAsync } from '@furystack/utils'
import { Constants } from 'common'

export const Pwm = {
  // Registers/etc.
  Mode1: 0x00,
  Mode2: 0x01,
  Subadr1: 0x02,
  Subadr2: 0x03,
  Subadr3: 0x04,
  Prescale: 0xfe,
  Led0OnL: 0x06,
  Led0OnH: 0x07,
  Led0OffL: 0x08,
  Led0OffH: 0x09,
  AllLedOnL: 0xfa,
  AllLedOnH: 0xfb,
  AllLedOffL: 0xfc,
  AllLedOffH: 0xfd,
  // Bits
  Restart: 0x80,
  Sleep: 0x10,
  Allcall: 0x01,
  Invrt: 0x10,
  Outdrv: 0x04,
}

@Injectable({ lifetime: 'singleton' })
export class ServoService {
  private readonly logger: ScopedLogger

  private lock = new Semaphore(1)

  private async init() {
    try {
      await this.lock.acquire()
      i2cSetSlaveAddress(0x6f)
      i2cBegin()
      this.setAllPwm({ on: 0, off: 0 })
      i2cWrite(new Buffer([Pwm.Mode2, Pwm.Outdrv]))
      i2cWrite(new Buffer([Pwm.Mode1, Pwm.Allcall]))
      await sleepAsync(5) // Wait for oscillator (?)
      i2cWrite(new Buffer([Pwm.Mode1]))
      const rxbuf = new Buffer(1)
      i2cRead(rxbuf, 1)
      const mode1 = rxbuf.readUInt8(0) & ~Pwm.Sleep
      i2cWrite(new Buffer([Pwm.Mode1, mode1]))
      await sleepAsync(5) // Wait for oscillator (?)
    } catch (error) {
      this.logger.warning({ message: 'Error initializing Servo Service', data: { error } })
    } finally {
      this.lock.release()
    }
  }

  public reset() {
    i2cWrite(new Buffer([0x00, 0x06]))
  }

  public setPwm({ channel, on, off }: { channel: Constants.ServoChannel; on: number; off: number }) {
    i2cWrite(new Buffer([Pwm.Led0OnL + 4 * channel, on & 0xff]))
    i2cWrite(new Buffer([Pwm.Led0OnH + 4 * channel, on >> 8]))
    i2cWrite(new Buffer([Pwm.Led0OffL + 4 * channel, off & 0xff]))
    i2cWrite(new Buffer([Pwm.Led0OffH + 4 * channel, off >> 8]))
  }

  public setAllPwm({ on, off }: { on: number; off: number }) {
    i2cWrite(new Buffer([Pwm.AllLedOnL, on & 0xff]))
    i2cWrite(new Buffer([Pwm.AllLedOnH, on >> 8]))
    i2cWrite(new Buffer([Pwm.AllLedOffL, off & 0xff]))
    i2cWrite(new Buffer([Pwm.AllLedOffH, off >> 8]))
  }

  constructor(injector: Injector) {
    this.logger = injector.logger.withScope('fury-rover/servo-service')
    this.init()
  }
}
