import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { join } from 'path'
import { Injectable, Injector } from '@furystack/inject'
import { ScopedLogger } from '@furystack/logging'
import { ObservableValue, Retrier } from '@furystack/utils'
import Semaphore from 'semaphore-async-await'

/**
 * Service class for Adafruit Motor HAT
 */
@Injectable({ lifetime: 'singleton' })
export class MotorService {
  writeLock = new Semaphore(1)

  private readonly pyService: ChildProcessWithoutNullStreams

  public readonly msgFromPy: ObservableValue<string> = new ObservableValue('')

  private listenStdOut() {
    let data = ''
    this.pyService.stdout.on('data', async (d) => {
      this.logger.debug({ message: `Data: ${d}` })
      data += d
      this.writeLock.release()
    })

    this.pyService.stderr.on('data', (d) => {
      this.logger.warning({ message: `Data: ${d}` })
      data += d
    })

    this.pyService.stdout.on('error', (d) => {
      this.logger.warning({ message: `Error: ${d}` })
      data += d
    })

    this.pyService.stdout.on('end', () => {
      this.msgFromPy.setValue(data)
      data = ''
    })

    this.pyService.on('exit', (code) => {
      this.logger.warning({
        message: `PythonMotorService exited with code ${code}`,
      })
    })
  }

  private async writeToPy(value: string) {
    try {
      await this.writeLock.acquire()
      await Retrier.create(async () => this.pyService.stdin.writable).setup({
        RetryIntervalMs: 1,
        Retries: 5,
        onFail: () => this.logger.warning({ message: 'Failed to write to stdin.' }),
      })
      this.logger.debug({ message: `Send to PythonService: ${value}` })
      this.pyService.stdin.write(`${value}\n`)
    } catch (error) {
      this.logger.warning({
        message: 'Error from PythonMotorService',
        data: { message: error.message, stack: error.stack },
      })
    } finally {
      // this.writeLock.release()
    }
  }

  public setMotorValue(motorId: number, motorValue: number) {
    return this.writeToPy(`set ${motorId} ${Math.round(motorValue)}`)
  }

  public setAll(motorValue: number) {
    return this.writeToPy(`setAll ${Math.round(motorValue)}`)
  }

  public stopAll() {
    return this.writeToPy(`stopAll`)
  }

  public set4(values: [number, number, number, number]) {
    return this.writeToPy(`set4 ${values.map((v) => Math.round(v)).join(' ')}`)
  }

  public setServos(servoValues: Array<{ id: number; value: number }>) {
    return this.writeToPy(`servo ${servoValues.map((v) => `${v.id}=${Math.round(v.value)}`).join(';')}`)
  }

  private readonly logger: ScopedLogger

  constructor(injector: Injector) {
    this.logger = injector.logger.withScope('@furystack-quad/PythonMotorService')
    const path = join(__filename, '..', '..', '..', 'MotorService.py')
    this.logger.verbose({
      message: `Spawning Python process with file ${path}`,
    })
    this.pyService = spawn('python3', [path], {
      cwd: process.cwd(),
      env: process.env,
    })
    this.listenStdOut()
    this.msgFromPy.subscribe((value) => this.logger.debug({ message: `@Py: ${value}` }))
  }
}
