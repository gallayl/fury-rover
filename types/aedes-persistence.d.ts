// declare module "aedes-persistence";

declare module "aedes-persistence" {
  class MemoryPersistence {
    /**
     * Store a retained message, calls the callback when it was saved.
     */
    public storeRetained();
    /**
     * Return a stream that will load all retained messages matching the given pattern (according to the MQTT spec) asynchronously. Deprecated.
     */
    public createRetainedStream();
    /**
     * Return a stream that will load all retained messages matching given patterns (according to the MQTT spec) asynchronously.
     */
    public createRetainedStreamCombi();
    public removeSubscriptions();
    public subscriptionsByClient();
    public countOffline();
    public subscriptionsByTopic();
    public cleanSubscriptions();
    public outgoingEnqueue();
    public outgoingEnqueueCombi();
    public outgoingUpdate();
    public outgoingClearMessageId();
    public outgoingStream();
    public addSubscriptions();
    public incomingStorePacket();
    public incomingGetPacket();
    public incomingDelPacket();
    public putWill();
    public getWill();
    public delWill();
    public streamWill();
    public getClientList();

    /**
     * Creates a new instance of a persistence, that is already ready to operate. The default implementation is in-memory only.
     */
    constructor();
  }

  export default MemoryPersistence;
}
