declare module 'simple-peer' {
  import { Duplex } from 'stream';

  interface Options {
    initiator?: boolean;
    channelConfig?: RTCDataChannelInit;
    channelName?: string;
    config?: RTCConfiguration;
    offerOptions?: RTCOfferOptions;
    answerOptions?: RTCAnswerOptions;
    sdpTransform?: (sdp: string) => string;
    stream?: MediaStream;
    streams?: MediaStream[];
    trickle?: boolean;
    allowHalfTrickle?: boolean;
    wrtc?: any;
    objectMode?: boolean;
  }

  interface SignalData {
    type?: 'offer' | 'pranswer' | 'answer' | 'rollback';
    sdp?: string;
    candidate?: RTCIceCandidateInit;
  }

  class SimplePeer extends Duplex {
    constructor(opts?: Options);
    signal(data: SignalData | string): void;
    send(data: string | Blob | ArrayBuffer | ArrayBufferView): void;
    addStream(stream: MediaStream): void;
    removeStream(stream: MediaStream): void;
    addTrack(track: MediaStreamTrack, stream: MediaStream): void;
    removeTrack(track: MediaStreamTrack, stream: MediaStream): void;
    replaceTrack(oldTrack: MediaStreamTrack, newTrack: MediaStreamTrack, stream: MediaStream): void;
    destroy(error?: Error): void;
    
    readonly connected: boolean;
    readonly destroyed: boolean;

    on(event: 'signal', listener: (data: SignalData) => void): this;
    on(event: 'connect', listener: () => void): this;
    on(event: 'data', listener: (data: Buffer) => void): this;
    on(event: 'stream', listener: (stream: MediaStream) => void): this;
    on(event: 'track', listener: (track: MediaStreamTrack, stream: MediaStream) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  namespace SimplePeer {
    export type Instance = SimplePeer;
    export type Options = Options;
    export type SignalData = SignalData;
  }

  export = SimplePeer;
}
