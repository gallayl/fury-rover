import { Injectable } from '@furystack/inject'
import Semaphore from 'semaphore-async-await'
import { Direction } from 'motor-hat'
import { RestClient } from './rest-client'

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
      const direction: Direction = options.throttle >= 0 ? 'fwd' : 'back'
      const throttle = Math.min(100, Math.abs(Math.round(options.throttle * 10))) // ToDo: 10?
      await this.api.call({
        method: 'POST',
        action: '/move',
        body: {
          direction,
          steerPercent: options.steerPercent,
          frontPercent: throttle,
          rearLeftPercent: throttle,
          rearRightPercent: throttle,
        },
      })
    }
  }

  constructor(private readonly api: RestClient) {}
}
