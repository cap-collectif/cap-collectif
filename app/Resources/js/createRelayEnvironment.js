// @flow
import * as React from 'react';
import type { Environment as TEnvironment } from 'react-relay';
// $FlowFixMe https://github.com/cap-collectif/platform/issues/5945
import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import RelayNetworkLogger from 'relay-runtime/lib/RelayNetworkLogger';
import executeFunction from './network/executeFunction';

export const graphqlError = (
  // eslint-disable-next-line react/no-unescaped-entities
  <p className="text-danger">Désolé une erreur s'est produite… Réessayez plus tard.</p>
);

// $FlowFixMe https://github.com/cap-collectif/platform/issues/5945
const store = new Store(new RecordSource());
// $FlowFixMe https://github.com/cap-collectif/platform/issues/5945
const network = Network.create(
  process.env.NODE_ENV === 'development'
    ? RelayNetworkLogger.wrapFetch(executeFunction)
    : executeFunction,
);

// $FlowFixMe https://github.com/cap-collectif/platform/issues/5945
export default (new Environment({
  network,
  store,
}): TEnvironment);
