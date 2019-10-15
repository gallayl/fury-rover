import { join } from "path";
import { InMemoryStore } from "@furystack/core";
import { Injector } from "@furystack/inject";
import { VerboseConsoleLogger } from "@furystack/logging";
import {
  LoginAction,
  LogoutAction,
  GetCurrentUser,
  HttpUserContext
} from "@furystack/http-api";
import "@furystack/typeorm-store";
import { EdmType } from "@furystack/odata";
import { DataSetSettings } from "@furystack/repository";
import { routing } from "./routing";
import { seed } from "./seed";
import { User, Session } from "./models";
import { registerExitHandler } from "./exitHandler";
import "./mqtt-injector-extensions";
import { Servo } from "./models/servo";
import { Motor } from "./models/motor";
import { MotorService } from "./services/motor-service";

export const authorizedOnly = async (options: { injector: Injector }) => {
  const authorized = await options.injector
    .getInstance(HttpUserContext)
    .isAuthenticated();
  return {
    isAllowed: authorized,
    message: "You are not authorized :("
  };
};

export const authorizedDataSet: Partial<DataSetSettings<any>> = {
  authorizeAdd: authorizedOnly,
  authorizeGet: authorizedOnly,
  authorizeRemove: authorizedOnly,
  authorizeUpdate: authorizedOnly,
  authroizeRemoveEntity: authorizedOnly
};

export const i = new Injector()
  .useLogging(VerboseConsoleLogger)
  .useTypeOrm({
    type: "sqlite",
    database: join(process.cwd(), "data.sqlite"),
    entities: [User, Session],
    logging: false,
    synchronize: true
  })
  .setupStores(stores =>
    stores
      .useTypeOrmStore(User)
      .useTypeOrmStore(Session)
      .addStore(new InMemoryStore({ model: Motor, primaryKey: "id" }))
      .addStore(new InMemoryStore({ model: Servo, primaryKey: "channel" }))
  )
  .useHttpApi({
    corsOptions: {
      credentials: true,
      origins: ["http://localhost:8080"],
      headers: ["cache", "content-type"]
    }
  })
  .useHttpAuthentication({
    getUserStore: sm => sm.getStoreFor(User),
    getSessionStore: sm => sm.getStoreFor(Session)
  })
  .useDefaultLoginRoutes()
  .addHttpRouting(routing)
  .listenHttp({
    port: parseInt(process.env.APP_SERVICE_PORT as string, 10) || 9090
  })
  .setupRepository(repo =>
    repo
      .createDataSet(User, {
        ...authorizedDataSet,
        name: "users"
      })
      .createDataSet(Servo, {
        name: "servos",
        authorizeAdd: async () => ({
          isAllowed: false,
          message:
            "Cannot add an entity into a prepopulated hardware collection"
        })
      })
      .createDataSet(Motor, {
        name: "motors",
        authorizeAdd: async () => ({
          isAllowed: false,
          message:
            "Cannot add an entity into a prepopulated hardware collection"
        }),
        onEntityUpdated: async ({ injector, id, change }) => {
          change.value &&
            injector
              .getInstance(MotorService)
              .setMotorValue(id as number, change.value);
        }
      })
  )
  .useOdata("odata", odata =>
    odata.addNameSpace("default", ns => {
      ns.setupEntities(entities =>
        entities
          .addEntityType({
            model: User,
            primaryKey: "username",
            properties: [{ property: "username", type: EdmType.String }],
            name: "User"
          })
          .addEntityType({
            model: Servo,
            name: "Servo",
            primaryKey: "channel",
            properties: [
              {
                property: "currentValue",
                type: EdmType.Int16
              }
            ]
          })
          .addEntityType({
            model: Motor,
            name: "Motor",
            primaryKey: "id",
            properties: [
              {
                property: "id",
                type: EdmType.Int16
              },
              { property: "isReversed", type: EdmType.Boolean },
              { property: "multiplier", type: EdmType.Int16 },
              { property: "value", type: EdmType.Int16 }
            ]
          })
      ).setupCollections(collections =>
        collections
          .addCollection({
            model: User,
            name: "users",
            functions: [
              {
                action: GetCurrentUser,
                name: "current"
              }
            ]
          })
          .addCollection({
            model: Motor,
            name: "motors"
          })
          .addCollection({
            model: Servo,
            name: "servos"
          })
      );

      ns.setupGlobalActions([
        {
          action: LoginAction,
          name: "login",
          parameters: [
            { name: "username", type: EdmType.String, nullable: false },
            { name: "password", type: EdmType.String, nullable: false }
          ]
        },
        { action: LogoutAction, name: "logout" }
      ]);

      return ns;
    })
  )
  .setupMqtt({
    mqttPort: 1883,
    aedesSettings: {}
  });

registerExitHandler(i);
seed(i);
