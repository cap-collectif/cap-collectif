// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import type { ProposalAdminNewsForm_proposal } from './__generated__/ProposalAdminNewsForm_proposal.graphql';

type DefaultProps = void;
type Props = {
  proposal: ProposalAdminNewsForm_proposal,
};
type State = void;

export class ProposalAdminNewsForm extends Component<
  DefaultProps,
  Props,
  State,
> {
  render() {
    const { proposal } = this.props;
    return (
      <div className="box box-primary">
        <div className="box-header">
          <h4 className="box-title">
            <FormattedMessage id="proposal.admin.news" />
          </h4>
          <a
            className="pull-right link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://aide.cap-collectif.com/article/86-editer-une-proposition-dune-etape-de-depot#actualite">
            <i className="fa fa-info-circle" />{' '}
            <FormattedMessage id="global.help" />
          </a>
        </div>
        <ListGroup style={{ margin: 10, paddingBottom: 10 }}>
          {proposal.news.map((news, index) =>
            <ListGroupItem key={index}>
              <div>
                {news.title}
              </div>
            </ListGroupItem>,
          )}
        </ListGroup>
      </div>
    );
  }
}

export default createFragmentContainer(
  ProposalAdminNewsForm,
  graphql`
    fragment ProposalAdminNewsForm_proposal on Proposal {
      id
      news {
        title
      }
    }
  `,
);
