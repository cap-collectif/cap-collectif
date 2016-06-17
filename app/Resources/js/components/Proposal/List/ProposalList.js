import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import ProposalPreview from '../Preview/ProposalPreview';
import { Row } from 'react-bootstrap';

const ProposalList = React.createClass({
  propTypes: {
    proposals: React.PropTypes.array.isRequired,
    selectionStep: React.PropTypes.object,
    creditsLeft: React.PropTypes.number,
    showAllVotes: React.PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      creditsLeft: null,
      selectionStep: null,
      showAllVotes: false,
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
                selectionStep={this.props.selectionStep}
                creditsLeft={this.props.creditsLeft}
                showAllVotes={this.props.showAllVotes}
              />
            );
          })
        }
      </Row>
    );
  },

});

export default ProposalList;
