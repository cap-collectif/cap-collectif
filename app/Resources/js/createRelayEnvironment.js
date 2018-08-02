// @flow
import * as React from 'react';
import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import RelayNetworkLogger from 'relay-runtime/lib/RelayNetworkLogger';
import executeFunction from './network/executeFunction';

export const graphqlError = (
  <p className="text-danger">Désolé une erreur s'est produite… Réessayez plus tard.</p>
);

const store = new Store(new RecordSource());
const network = Network.create(
  process.env.NODE_ENV === 'development'
    ? RelayNetworkLogger.wrapFetch(executeFunction)
    : executeFunction,
);

export default new Environment({
  network,
  store,
});
