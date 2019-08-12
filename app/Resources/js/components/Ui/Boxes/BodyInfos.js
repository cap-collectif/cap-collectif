// @flow
import React from 'react';
import BodyText from './BodyText';
import { Card } from "../Card/Card";

type Props = {|
  +body: string,
  +maxLength?: number
|};

export class BodyInfos extends React.Component<Props> {

  render() {
    const { body, maxLength } = this.props;
    return body ? (
      <Card>
        <Card.Body>
          <BodyText
            { ...((maxLength) ? { maxLength } : {} ) }
            text={body} />
        </Card.Body>
      </Card>
    ) : null;
  }
}

export default BodyInfos
