// @flow
import React from 'react';
import BodyText from './BodyText';
import { Card } from "../Card/Card";

type Props = {|
  +body: string,
  +maxLines?: number
|};

export class BodyInfos extends React.Component<Props> {

  render() {
    const { body, maxLines } = this.props;
    return body ? (
      <Card>
        <Card.Body className="body__infos--body">
          <BodyText
            { ...((maxLines) ? { maxLines } : {} ) }
            text={body} />
        </Card.Body>
      </Card>
    ) : null;
  }
}

export default BodyInfos
