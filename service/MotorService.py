import sys
import string
from adafruit_motorkit import MotorKit

kit = MotorKit()

while True:
    line = sys.stdin.readline()
    if (line.startswith("motor")):
        [command, motorString, valueString] = line.split(' ')
        [motorId, value] = [int(motorString), float(valueString)]
        kit[]
        sys.stdout.write("Motor ")
        sys.stdout.write(motorString)
        sys.stdout.write(" has been set to ")
        sys.stdout.write(valueString)
        sys.stdout.flush()
    else:
        sys.stdout.write("Echo ")
        sys.stdout.write(line)
        sys.stdout.flush()
