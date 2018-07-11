// @flow
import * as React from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import classNames from 'classnames';
import OpinionPreview from '../OpinionPreview';

type Props = { link: Object };

class OpinionLink extends React.Component<Props> {
  render() {
    const { link } = this.props;
    const classes = classNames({
      opinion: true,
      'block--bordered': true,
      'list-group-custom': true,
      'mb-0': true,
      'bg-vip': link.author && link.author.vip,
    });

    return (
      <ListGroup className={classes}>
        <ListGroupItem className="list-group-item__opinion">
          <div className="left-block">
            <OpinionPreview rankingThreshold={null} opinion={link} showTypeLabel />
          </div>
        </ListGroupItem>
      </ListGroup>
    );
  }
}

export default OpinionLink;
