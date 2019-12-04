// @flow
import React from 'react';
import styled from 'styled-components';
import BodyText, { DEFAULT_MAX_LINES, LINE_HEIGHT } from './BodyText';
import { Card } from '../Card/Card';

type Media = {|
  +name: string,
  +url: string,
|};

type Props = {|
  +body: string,
  +illustration?: ?Media,
  +maxLines?: number,
|};

const CardBodyInfos = styled(Card.Body).attrs({
  className: 'body__infos--body',
})`
  display: block;
  & img.body__infos--illustration {
    max-height: ${props => LINE_HEIGHT * props.maxLines}px;
    margin: 0 15px 15px 0;
    float: left;
  }
  & .body__infos__content {
    display: inline;
  }
`;

export class BodyInfos extends React.Component<Props> {
  render() {
    const { body, maxLines, illustration } = this.props;
    return body ? (
      <Card>
        <CardBodyInfos maxLines={maxLines || DEFAULT_MAX_LINES}>
          {illustration && (
            <img
              className="body__infos--illustration"
              src={illustration.url}
              alt={illustration.name || ''}
            />
          )}
          <BodyText {...(maxLines ? { maxLines } : {})} text={body} />
        </CardBodyInfos>
      </Card>
    ) : null;
  }
}

export default BodyInfos;
