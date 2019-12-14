import sys
import string
from adafruit_motorkit import MotorKit
# ToDo:
# from adafruit_servokit import ServoKit
# servoKit = ServoKit(channels=16)

kit = MotorKit(address=0x6f)

while True:
    try:
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
        if (line.startswith("setAll ")):
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
        if (line.startswith("set4 ")):
            [command, v1s, v2s, v3s, v4s] = line.split(' ')
            [v1, v2, v3, v4] = [float(v1s), float(v2s), float(v3s), float(v4s)]
            kit.motor1.throttle = v1
            kit.motor2.throttle = v2
            kit.motor3.throttle = v3
            kit.motor4.throttle = v4
            continue
        else:
            sys.stdout.write("Unkown command: ")
            sys.stdout.write(line)
            sys.stdout.write("\r\n")
            sys.stdout.flush()
            continue
        pass
    except Exception as e:
        sys.stderr.write(str(e))
        sys.stderr.write('\r\n')
        sys.stderr.flush()
