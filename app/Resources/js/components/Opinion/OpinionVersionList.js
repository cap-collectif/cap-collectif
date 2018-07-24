// @flow
import React from 'react';
import {ListGroup} from "react-bootstrap";
import { FormattedMessage } from 'react-intl';
import OpinionVersion from './OpinionVersion';

type Props = {
  versions: Array<$FlowFixMe>,
  rankingThreshold: ?number,
};

class OpinionVersionList extends React.Component<Props> {
  render() {
    const { rankingThreshold, versions } = this.props;
    if (versions.length === 0) {
      return (
        <p className="text-center">
          <i className="cap-32 cap-baloon-1" />
          <br />
          <FormattedMessage id="opinion.no_new_version" />
        </p>
      );
    }

    return (
      <ListGroup className="list-group-custom">
        {versions.map(version => {
          return (
            <OpinionVersion
              key={version.id}
              version={version}
              rankingThreshold={rankingThreshold || null}
            />
          );
        })}
      </ListGroup>
    );
  }
}

export default OpinionVersionList;
