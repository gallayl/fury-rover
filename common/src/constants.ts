export const SERVOS = {
  pitch: 0,
  yaw: 1,
  steer: 15,
}

export const SERVO_CALIBRATION: { [key in keyof typeof SERVOS]: { minPulse: number; maxPulse: number } } = {
  pitch: { minPulse: 1, maxPulse: 2 },
  yaw: { minPulse: 1, maxPulse: 2 },
  steer: { minPulse: 1, maxPulse: 2 },
}

export const MOTORS = {
  front: 'M3',
  rearLeft: 'M1',
  rearRight: 'M2',
}
