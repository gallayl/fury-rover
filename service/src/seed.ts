import { User } from 'common'
import { PhysicalStore, StoreManager, FindOptions } from '@furystack/core'
import '@furystack/repository'
import { HttpAuthenticationSettings } from '@furystack/rest-service'
import { Injector } from '@furystack/inject'
import { injector as mainInjector, storeFiles } from './config'
import { existsSync, writeFileSync } from 'fs'

/**
 * gets an existing instance if exists or create and return if not. Throws error on multiple result
 * @param filter The filter term
 * @param instance The instance to be created if there is no instance present
 * @param store The physical store to use
 */
export const getOrCreate = async <T>(
  filter: FindOptions<T, Array<keyof T>>,
  instance: T,
  store: PhysicalStore<T>,
  injector: Injector,
) => {
  const result = await store.find(filter)
  const logger = injector.logger.withScope('Seeder')
  if (result.length === 1) {
    return result[0]
  } else if (result.length === 0) {
    logger.verbose({
      message: `Entity of type '${store.model.name}' not exists, adding: '${JSON.stringify(filter)}'`,
    })
    return await store.add(instance)
  } else {
    const message = `Seed filter contains '${result.length}' results for ${JSON.stringify(filter)}`
    logger.warning({ message })
    throw Error(message)
  }
}

/**
 * Seeds the databases with predefined values
 * @param injector The injector instance
 */
export const seed = async (injector: Injector) => {
  const logger = injector.logger.withScope('seeder')
  logger.verbose({ message: 'Seeding data...' })
  const sm = injector.getInstance(StoreManager)
  const userStore = sm.getStoreFor(User)

  Object.entries(storeFiles).map(([name, file]) => {
    if (!existsSync(file)) {
      logger.verbose({ message: `DB file for '${name}' does not exists, creating... `, data: { file } })
      writeFileSync(file, '[]')
    }
  })

  await getOrCreate(
    { filter: { username: { $eq: 'testuser' } } },
    {
      username: 'testuser',
      password: injector.getInstance(HttpAuthenticationSettings).hashMethod('password'),
      roles: [],
    } as User,
    userStore as PhysicalStore<User>,
    injector,
  )

  logger.verbose({ message: 'Seeding data completed.' })
}

seed(mainInjector)
  .then(async () => {
    await mainInjector.dispose()
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
