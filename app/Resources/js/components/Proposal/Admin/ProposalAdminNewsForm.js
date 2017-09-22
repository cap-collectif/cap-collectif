// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { baseUrl } from '../../../config';
import type { ProposalAdminNewsForm_proposal } from './__generated__/ProposalAdminNewsForm_proposal.graphql';

type DefaultProps = void;
type Props = {
  proposal: ProposalAdminNewsForm_proposal,
};
type State = void;

export class ProposalAdminNewsForm extends Component<Props, State> {
  static defaultProps: DefaultProps;
  render() {
    const { proposal } = this.props;
    return (
      <div className="box box-primary container">
        <div className="box-header">
          <h4 className="box-title">
            <FormattedMessage id="proposal.admin.news" />
          </h4>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/86-editer-une-proposition-dune-etape-de-depot#actualite">
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>
        <div className="box-content">
          <ListGroup style={{ paddingBottom: 10 }}>
            {proposal.news.map((news, index) => (
              <ListGroupItem key={index}>
                <Row>
                  <Col xs={6}>{news.title}</Col>
                  <Col xs={6}>
                    <ButtonToolbar className="pull-right">
                      <Button
                        bsStyle="warning"
                        href={`${baseUrl}/admin/capco/app/post/${news.id}/edit`}>
                        <FormattedMessage id="global.edit" />
                      </Button>
                      <Button
                        bsStyle="danger"
                        href={`${baseUrl}/admin/capco/app/post/${news.id}/delete`}>
                        <FormattedMessage id="global.delete" />
                      </Button>
                    </ButtonToolbar>
                  </Col>
                </Row>
              </ListGroupItem>
            ))}
          </ListGroup>
          <ButtonToolbar style={{ marginBottom: 10 }}>
            <Button bsStyle="primary" href={`${baseUrl}/admin/capco/app/post/create`}>
              <FormattedMessage id="global.add" />
            </Button>
          </ButtonToolbar>
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(
  ProposalAdminNewsForm,
  graphql`
    fragment ProposalAdminNewsForm_proposal on Proposal {
      news {
        id
        title
      }
    }
  `,
);
