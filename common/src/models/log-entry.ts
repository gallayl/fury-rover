import { LogLevel } from '@furystack/logging'
export class LogEntry {
  /**
   * Date in ISO String Format
   */
  date!: string

  /**
   * A well-defined scope for grouping entries, e.g. a component or service name.
   */
  scope!: string

  /**
   * The message string
   */
  message!: string

  /**
   * Additional entry data
   */
  data?: any

  /**
   * The verbosity level of the log entry
   */
  level!: LogLevel
}
