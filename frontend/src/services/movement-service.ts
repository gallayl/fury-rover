import { Injectable } from '@furystack/inject'
import Semaphore from 'semaphore-async-await'
import { RestClient } from './rest-client'
import { Constants } from 'common'

@Injectable({ lifetime: 'singleton' })
export class MovementService {
  private readonly lock = new Semaphore(1)

  private nextTick?: () => Promise<void>

  private async tick() {
    if (this.nextTick) {
      try {
        await this.lock.acquire()
        if (this.nextTick) {
          await this.nextTick()
          this.nextTick = undefined
        }
      } finally {
        this.lock.release()
      }
    }
  }

  public dispose() {
    clearInterval(this.interval)
  }

  private interval = setInterval(this.tick.bind(this), 10)

  public async release() {
    this.nextTick = async () => {
      this.api.call({
        method: 'POST',
        action: '/release',
      })
    }
  }

  public async move(options: { throttle: number; steerPercent: number }) {
    this.nextTick = async () => {
      const direction: Constants.Direction = options.throttle >= 0 ? 'forward' : 'back'
      const throttle = Math.min(512, Math.abs(Math.round(options.throttle * 30))) // ToDo: 10?

      const steer = 90 + (options.steerPercent - 50) * 0.6

      await this.api.call({
        method: 'POST',
        action: '/move',
        body: {
          direction,
          steer,
          frontThrottle: throttle,
          rearLeftThrottle: throttle,
          rearRightThrottle: throttle,
        },
      })
    }
  }

  constructor(private readonly api: RestClient) {}
}
