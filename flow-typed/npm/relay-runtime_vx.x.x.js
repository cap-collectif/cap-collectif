import type { RecordProxy } from 'react-relay';

declare module 'relay-runtime' {
  
  declare export type ConcreteFragment = any;
  declare export type ReaderFragment = any;
  declare export type FragmentReference = any;
  declare export type ConcreteRequest = any;
  declare export type RequestNode = any;

  declare export class ConnectionHandler {
    static getConnection: (
      record: RecordProxy,
      key: string,
      filters?: ?Object
    ) =>?RecordProxy;
    static insertEdgeAfter: (
      record: RecordProxy,
      newEdge: RecordProxy,
      cursor?: ?string
    ) => void;
    static insertEdgeBefore: (
      record: RecordProxy,
      newEdge: RecordProxy,
      cursor?: ?string
    ) => void;
    static deleteNode: (
      record: RecordProxy,
      key: string
    ) => void;
  }

  declare export type Store = any;
  declare export type Environment = any;
  declare export type Network = any;
  declare export type RecordSource = any;
  declare export function graphql(strings: Array<string>): any;

  declare export function fetchQuery(
    environment: any,
    proxy: any,
    variables: any
  ): Promise<*>;
}

declare module 'relay-runtime/lib/RelayNetworkLogger' {
  declare module.exports: any;
}
