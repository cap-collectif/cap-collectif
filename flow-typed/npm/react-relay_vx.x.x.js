import * as React from 'react';

declare module "areEqual" {
  declare module.exports: any;
};

declare module "mapObject" {
  declare module.exports: any;
};

declare module "forEachObject" {
  declare module.exports: any;
};

declare module "graphql" {
  declare module.exports: any;
};

declare module "resolveImmediate" {
  declare module.exports: any;
};

declare module "ErrorUtils" {
  declare module.exports: any;
};

declare module "sprintf" {
  declare module.exports: any;
};

declare module "removeFromArray" {
  declare module.exports: any;
};

declare module "emptyFunction" {
  declare module.exports: any;
};

// Cannot create QueryRenderer element because inexact RenderProps [1] is incompatible with exact object type [2] in the
// first argument of property render.
declare type ReactRelayReadyState = {
  error: ?Error,
  props: ?Object,
  retry: ?() => void,
};

type ReactRelayRecordSourceSelectorProxy = {
    create(dataID: DataID, typeName: string): RecordProxy;

    delete(dataID: DataID): void;

    get(dataID: DataID): ?RecordProxy;

    getRoot(): RecordProxy;

    getRootField(fieldName: string): RecordProxy;

    getPluralRootField(fieldName: string): ?Array<?RecordProxy>;

    getResponse(): ?Object;
};

type ReactRelayUploadableMap = { [key: string]: Uploadable };

type ReactRelayVariables = { [name: string]: $FlowFixMe };

/**
* Settings for how a query response may be cached.
*
* - `force`: causes a query to be issued unconditionally, irrespective of the
*   state of any configured response cache.
* - `poll`: causes a query to live update by polling at the specified interval
in milliseconds. (This value will be passed to setTimeout.)
*/
type ReactRelayCacheConfig = {
    force?: ?boolean,
    poll?: ?number
};


type ReactRelayMutationConfig<T> = {|
    configs?: Array<RelayMutationConfig>,
    mutation: GraphQLTaggedNode,
    variables: Variables,
    uploadables?: UploadableMap,
    onCompleted?: ?(response: T, errors: ?Array<PayloadError>) => void,
    onError?: ?(error: Error) => void,
    optimisticUpdater?: ?SelectorStoreUpdater,
    optimisticResponse?: Object,
    updater?: ?SelectorStoreUpdater
|};
