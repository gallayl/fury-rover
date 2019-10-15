import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { join } from "path";
import { Injectable, Injector } from "@furystack/inject";
import { ScopedLogger } from "@furystack/logging";
import { ObservableValue } from "@sensenet/client-utils";

/**
 * Service class for Adafruit Motor HAT
 */
@Injectable({ lifetime: "singleton" })
export class MotorService {
  private readonly pyService: ChildProcessWithoutNullStreams;

  public readonly msgFromPy: ObservableValue<string> = new ObservableValue("");

  private listenStdOut() {
    let data = "";
    this.pyService.stdout.on("data", d => {
      this.logger.debug({ message: `Data: ${d}` });
      data += d;
    });

    this.pyService.stdout.on("error", d => {
      this.logger.warning({ message: `Data: ${d}` });
      data += d;
    });
    this.pyService.stdout.on("end", () => {
      this.msgFromPy.setValue(data);
      data = "";
    });

    this.pyService.on("exit", code => {
      this.logger.warning({
        message: `PythonMotorService exited with code ${code}`
      });
    });
  }

  public setMotorValue(motorId: number, motorValue: number) {
    this.pyService.stdin.writable &&
      this.pyService.stdin.write(`motor ${motorId} ${motorValue}\n`);
  }

  private readonly logger: ScopedLogger;

  constructor(injector: Injector) {
    this.logger = injector.logger.withScope(
      "@furystack-quad/PythonMotorService"
    );
    const path = join(process.cwd(), "PythonMotorService.py");
    this.logger.verbose({
      message: `Spawning Python process with file ${path}`
    });
    this.pyService = spawn("python", [path]);
    this.listenStdOut();
    this.msgFromPy.subscribe(value =>
      this.logger.debug({ message: `@Py: ${value}` })
    );
  }
}
