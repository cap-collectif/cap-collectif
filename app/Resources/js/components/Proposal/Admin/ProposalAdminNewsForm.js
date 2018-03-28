// @flow
import React, { Component } from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { baseUrl } from '../../../config';
import type { ProposalAdminNewsForm_proposal } from './__generated__/ProposalAdminNewsForm_proposal.graphql';

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
          {proposal.news.length !== 0 ? (
            <ListGroup>
              {proposal.news.map((news, index) => (
                <ListGroupItem key={index}>
                  <Row>
                    <Col xs={6}>
                      <strong>{news.title}</strong>
                    </Col>
                    <Col xs={6}>
                      <ButtonToolbar className="pull-right">
                        <Button
                          bsStyle="warning"
                          className="btn-outline-warning"
                          href={`${baseUrl}/admin/capco/app/post/${news.id}/edit`}>
                          <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
                        </Button>
                        <Button
                          bsStyle="danger"
                          className="btn-outline-danger"
                          href={`${baseUrl}/admin/capco/app/post/${news.id}/delete`}>
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
          <ButtonToolbar style={{ marginBottom: 10 }} className="box-content__toolbar">
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

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalAdminNewsForm_proposal on Proposal {
      news {
        id
        title
      }
    }
  `,
);
