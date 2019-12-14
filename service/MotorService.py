import sys
import string
from adafruit_motorkit import MotorKit

kit = MotorKit(address=0x6f)

while True:
    line = sys.stdin.readline()
    if (line.startswith("set ")):
        [command, motorString, valueString] = line.split(' ')
        [motorId, value] = [int(motorString), float(valueString)]
        getattr(kit, "motor" + str(motorId)).throttle = value
        sys.stdout.write("Motor ")
        sys.stdout.write(motorString)
        sys.stdout.write(" has been set to ")
        sys.stdout.write(valueString)
        sys.stdout.write("\r\n")
        sys.stdout.flush()
        continue
    if (line.startswith("setAll")):
        [command, valueString] = line.split(' ')
        value = float(valueString)
        kit.motor1.throttle = value
        kit.motor2.throttle = value
        kit.motor3.throttle = value
        kit.motor4.throttle = value
        sys.stdout.write("All motors has been set to ")
        sys.stdout.write(valueString)
        sys.stdout.write("\r\n")
        sys.stdout.flush()
        continue
    if (line.startswith("stopAll")):
        kit.motor1.throttle = 0
        kit.motor2.throttle = 0
        kit.motor3.throttle = 0
        kit.motor4.throttle = 0
        sys.stdout.write("All stopped.")
        sys.stdout.write("\r\n")
        sys.stdout.flush()
        continue
    else:
        sys.stdout.write("Unkown command: ")
        sys.stdout.write(line)
        sys.stdout.write("\r\n")
        sys.stdout.flush()
        continue
