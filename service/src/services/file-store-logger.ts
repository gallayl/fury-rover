import { AbstractLogger, LeveledLogEntry, LogLevel } from '@furystack/logging'
import { Injectable } from '@furystack/inject'
import { LogEntry } from 'common'
import { StoreManager } from '@furystack/core'
import { FileSystemStore } from '@furystack/filesystem-store'

@Injectable()
export class FileStoreLogger extends AbstractLogger {
  private logLevels: LogLevel[] = [LogLevel.Error, LogLevel.Fatal, LogLevel.Warning, LogLevel.Information]
  public dispose() {
    this.logLevels = []
  }

  private readonly logStore: FileSystemStore<LogEntry>

  public async addEntry<T>(entry: LeveledLogEntry<T>) {
    if (this.logLevels.includes(entry.level) && this.logStore.tick) {
      const scope = entry.scope || 'unknown'
      await this.logStore.add({ ...entry, date: new Date().toISOString(), scope })
    }
  }

  constructor(storeManager: StoreManager) {
    super()
    this.logStore = storeManager.getStoreFor<LogEntry, FileSystemStore<LogEntry>>(LogEntry)
  }
}
