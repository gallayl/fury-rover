export type Direction = 'forward' | 'back' | 'release'

export type MotorChannel = 0 | 1 | 2 | 3

export type ServoChannel = 0 | 1 | 14 | 15

export const SERVOS = {
  pitch: 14,
  yaw: 15,
  steer: 1,
}

export const MOTORS = {
  left: 3,
  right: 2,
}
