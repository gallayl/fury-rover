import sys
import string
from Raspi_MotorHAT import Raspi_MotorHAT, Raspi_DCMotor
import atexit
import time

mh = Raspi_MotorHAT(addr=0x6f, freq=50)

servoMin = 150  # Min pulse length out of 4096
servoMax = 510  # Max pulse length out of 4096


def arduino_map(x, in_min, in_max, out_min, out_max):
    return (x - in_min) * (out_max - out_min) // (in_max - in_min) + out_min


def turnOffMotors():
    mh._pwm.setAllPWM(0, 0)
    mh.getMotor(1).run(Raspi_MotorHAT.RELEASE)
    mh.getMotor(2).run(Raspi_MotorHAT.RELEASE)
    mh.getMotor(3).run(Raspi_MotorHAT.RELEASE)
    mh.getMotor(4).run(Raspi_MotorHAT.RELEASE)


def setMotor(channel, value):
    motor = mh.getMotor(channel)
    if (value > 0):
        motor.run(mh.FORWARD)
    else:
        if (value < 0):
            motor.run(mh.BACKWARD)
        else:
            motor.run(mh.RELEASE)
    value = max(min(abs(value), 255), 0)
    motor.setSpeed(value)
    sys.stdout.write("Motor " + str(channel) + " has been set to " + str(value) + "\r\n")
    sys.stdout.flush()
    time.sleep(0.005)


def setServo(channel, value):
    if (channel not in [0, 1, 14, 15]):
        sys.stdout.write(str(channel) + " is invalid. Has to be 0, 1 ,14 or 15\r\n")
        sys.stdout.flush()
        return
    value = arduino_map(value, 0, 180, servoMin, servoMax)
    mh.setPwm(channel, 0, value)
    sys.stdout.write("Servo " + str(channel) + " has been set to " + str(value) + "\r\n")
    sys.stdout.flush()
    time.sleep(0.005)


atexit.register(turnOffMotors)

while True:
    try:
        line = sys.stdin.readline()
        # format: servo 1=15;2=25;
        if (line.startswith("servo ")):
            [command, servos] = line.split(' ')
            servoValues = servos.split(';')
            for servo in servoValues:
                [servoIdStr, servoValueStr] = servo.split('=')
                servoId = int(servoIdStr)
                servoValue = int(servoValueStr)
                setServo(servoId, servoValue)
            continue
        if (line.startswith("set ")):
            [command, motorString, valueString] = line.split(' ')
            [motorId, value] = [int(motorString), int(valueString)]
            setMotor(int(motorString), value)
            continue
        if (line.startswith("setAll ")):
            [command, valueString] = line.split(' ')
            value = int(valueString)
            setMotor(1, value)
            setMotor(2, value)
            setMotor(3, value)
            setMotor(4, value)
            continue
        if (line.startswith("stopAll")):
            turnOffMotors()
            sys.stdout.write("All stopped.")
            sys.stdout.write("\r\n")
            sys.stdout.flush()
            continue
        if (line.startswith("set4 ")):
            [command, v1s, v2s, v3s, v4s] = line.split(' ')
            [v1, v2, v3, v4] = [int(v1s), int(v2s), int(v3s), int(v4s)]
            setMotor(1, v1)
            setMotor(2, v2)
            setMotor(3, v3)
            setMotor(4, v4)
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