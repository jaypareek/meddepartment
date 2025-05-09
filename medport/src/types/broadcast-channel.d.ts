// Type definitions for BroadcastChannel API
interface BroadcastChannelEventMap {
  message: MessageEvent;
  messageerror: MessageEvent;
}

interface BroadcastChannel extends EventTarget {
  /**
   * Returns the channel name (as passed to the constructor).
   */
  readonly name: string;
  
  /**
   * Closes the BroadcastChannel object, opening it up to garbage collection.
   */
  close(): void;
  
  /**
   * Sends the given message to other BroadcastChannel objects set up for this channel.
   * Messages can be structured objects, e.g. nested objects and arrays.
   */
  postMessage(message: any): void;
  
  onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null;
  onmessageerror: ((this: BroadcastChannel, ev: MessageEvent) => any) | null;
  
  addEventListener<K extends keyof BroadcastChannelEventMap>(
    type: K,
    listener: (this: BroadcastChannel, ev: BroadcastChannelEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof BroadcastChannelEventMap>(
    type: K,
    listener: (this: BroadcastChannel, ev: BroadcastChannelEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

interface BroadcastChannelConstructor {
  prototype: BroadcastChannel;
  new(name: string): BroadcastChannel;
}

declare var BroadcastChannel: BroadcastChannelConstructor;