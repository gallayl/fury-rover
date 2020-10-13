export type Direction = 'forward' | 'back' | 'release'

export type MotorChannel = 0 | 1 | 2 | 3

export type ServoChannel = 0 | 1 | 14 | 15

export const SERVOS = {
  pitch: 0,
  yaw: 1,
  steer: 15,
}

export const MOTORS = {
  front: 3,
  rearLeft: 1,
  rearRight: 2,
}
