// @flow
import React, { Component } from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ButtonToolbar, Button, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { baseUrl } from '../../../config';
import type { ProposalAdminNewsForm_proposal } from '~relay/ProposalAdminNewsForm_proposal.graphql';

type DefaultProps = void;
type Props = {
  proposal: ProposalAdminNewsForm_proposal,
  intl: IntlShape,
};
type State = void;

export class ProposalAdminNewsForm extends Component<Props, State> {
  static defaultProps: DefaultProps;

  render() {
    const { proposal, intl } = this.props;

    return (
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="proposal.admin.news" />
          </h3>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href={intl.formatMessage({ id: 'admin.help.link.proposal.news' })}>
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>
        <div className="box-content">
          {proposal.news.totalCount !== 0 ? (
            <ListGroup>
              {proposal.news.edges &&
                proposal.news.edges.filter(Boolean).map((news, index) => (
                  <ListGroupItem key={index}>
                    <Row>
                      <Col xs={6}>
                        <strong>{news.node.title}</strong>
                      </Col>
                      <Col xs={6}>
                        <ButtonToolbar className="pull-right">
                          <Button
                            bsStyle="warning"
                            className="btn-outline-warning"
                            href={news.node.adminUrl}>
                            <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
                          </Button>
                          <Button
                            bsStyle="danger"
                            className="btn-outline-danger"
                            href={news.node.adminUrl.replace('/edit', '/delete')}>
                            <i className="fa fa-trash" />
                          </Button>
                        </ButtonToolbar>
                      </Col>
                    </Row>
                  </ListGroupItem>
                ))}
            </ListGroup>
          ) : (
            <FormattedMessage id="proposal.admin.news.empty" />
          )}
          <ButtonToolbar className="box-content__toolbar">
            <Button bsStyle="primary" href={`${baseUrl}/admin/capco/app/post/create`}>
              <FormattedMessage id="global.add" />
            </Button>
          </ButtonToolbar>
        </div>
      </div>
    );
  }
}

const container = injectIntl(ProposalAdminNewsForm);

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalAdminNewsForm_proposal on Proposal {
      news {
        totalCount
        edges {
          cursor
          node {
            adminUrl
            title
          }
        }
      }
    }
  `,
});
