import * as React from 'react';
import { type RenderProps } from 'react-relay/ReactRelayQueryRenderer.js.flow';

type ReactRelayReadyState = RenderProps;

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