import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import ProposalPreview from '../Preview/ProposalPreview';
import { Row } from 'react-bootstrap';

const ProposalList = React.createClass({
  propTypes: {
    proposals: React.PropTypes.array.isRequired,
    selectionStepId: React.PropTypes.number,
    creditsLeft: React.PropTypes.number,
    voteType: React.PropTypes.number,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      selectionStepId: null,
      creditsLeft: null,
      voteType: 0,
    };
  },

  render() {
    if (this.props.proposals.length === 0) {
      return <p>{ this.getIntlMessage('proposal.empty') }</p>;
    }

    const classes = classNames({
      'media-list': true,
      'opinion__list': true,
    });

    return (
      <Row componentClass="ul" className={classes}>
        {
          this.props.proposals.map((proposal) => {
            return (
              <ProposalPreview
                key={proposal.id}
                proposal={proposal}
                selectionStepId={this.props.selectionStepId}
                creditsLeft={this.props.creditsLeft}
                voteType={this.props.voteType}
              />
            );
          })
        }
      </Row>
    );
  },

});

export default ProposalList;
