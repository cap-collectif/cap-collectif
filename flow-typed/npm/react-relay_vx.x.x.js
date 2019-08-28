import * as React from 'react';
import { type RenderProps } from 'react-relay/ReactRelayQueryRenderer.js.flow';

// TODO find better export
type ReadyState = RenderProps;

type RecordSourceSelectorProxy = {
    create(dataID: DataID, typeName: string): RecordProxy;

    delete(dataID: DataID): void;

    get(dataID: DataID): ?RecordProxy;

    getRoot(): RecordProxy;

    getRootField(fieldName: string): RecordProxy;

    getPluralRootField(fieldName: string): ?Array<?RecordProxy>;

    getResponse(): ?Object;
};
