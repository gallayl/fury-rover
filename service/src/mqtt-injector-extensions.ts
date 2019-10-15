import { createServer } from "net";
import { Injector } from "@furystack/inject/dist/Injector";
import { Server as AedesServer, AedesOptions } from "aedes";
import ws from "websocket-stream";
import { ServerManager } from "@furystack/core";
import InMemoryPersistence from "aedes-persistence";

export interface MqttSettings {
  mqttPort: number;
  aedesSettings?: AedesOptions;
}

declare module "@furystack/inject/dist/Injector" {
  interface Injector {
    setupMqtt: (settings: MqttSettings) => Injector;
  }
}

Injector.prototype.setupMqtt = function(settings) {
  const logger = this.logger.withScope("Mqtt");
  const aedesServer = AedesServer({
    ...settings.aedesSettings,
    persistence: new InMemoryPersistence(),
    authenticate: (_client, _username, _password, done) => {
      done(null, true);
    }
  });

  const mqttServer = createServer(aedesServer.handle);
  mqttServer.listen(settings.mqttPort, () => {
    logger.information({
      message: `MQTT server is listening at port ${settings.mqttPort}`
    });
  });

  for (const server of this.getInstance(ServerManager).getServers()) {
    ws.createServer(
      {
        server
      },
      aedesServer.handle as any
    );
  }

  this.setExplicitInstance(aedesServer);
  return this;
};
