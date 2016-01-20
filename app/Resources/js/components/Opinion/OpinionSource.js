import React from 'react';
import classNames from 'classnames';
import UserAvatar from '../User/UserAvatar';
import OpinionInfos from './OpinionInfos';
import OpinionSourceButtons from './OpinionSourceButtons';
import {Label, Row, Col} from 'react-bootstrap';
import {IntlMixin} from 'react-intl';

const OpinionSource = React.createClass({
  propTypes: {
    source: React.PropTypes.object,
  },
  mixins: [IntlMixin],

  render() {
    const source = this.props.source;
    const classes = classNames({
      'opinion': true,
      'block--bordered': true,
      'bg-vip': source.author && source.author.vip,
    });
    return (
      <li className={classes} id={'source-' + source.id}>
        <Row>
          <Col xs={12}>
            <div className="opinion__body box">
              <UserAvatar user={source.author} className="pull-left" />
              <div className="opinion__data">
                <OpinionInfos opinion={source} />
                <h3 className="opinion__title">
                  <Label bsStyle="primary">{ source.category.title }</Label>
                  <a className="external-link" href={source.link}>
                    { source.title }
                  </a>
                </h3>
                <p className="excerpt">
                  { source.body }
                </p>
                <p className="opinion__votes excerpt small">
                  <OpinionSourceButtons {...this.props} />
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </li>
    );
  },

});

export default OpinionSource;
