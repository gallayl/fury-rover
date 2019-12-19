import '@furystack/odata-fetchr'
import { Injectable, Injector } from '@furystack/inject'
import { Servo } from '../entity-types/servo'

/**
 * Service class for collection servos
 * File created by @furystack/odata-fetchr
 */
@Injectable({ lifetime: 'singleton' })
export class Servos {
  /**
   * Custom action 'Set4'
   */
  public setValues = (values: Array<{ id: number; value: number }>) =>
    this.getService().execCustomCollectionAction('setValues', {
      values,
    })
  public readonly entitySetUrl = 'servos'
  public getService = () => this.injector.getOdataServiceFor(Servo, 'servos')
  constructor(private injector: Injector) {}
}
