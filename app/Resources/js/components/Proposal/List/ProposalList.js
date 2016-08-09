import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import ProposalPreview from '../Preview/ProposalPreview';
import { Row } from 'react-bootstrap';

const ProposalList = React.createClass({
  propTypes: {
    proposals: PropTypes.array.isRequired,
    selectionStep: PropTypes.object,
    creditsLeft: PropTypes.number,
    showAllVotes: PropTypes.bool,
    showThemes: PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      creditsLeft: null,
      selectionStep: null,
      showAllVotes: false,
      showThemes: false,
    };
  },

  render() {
    const {
      creditsLeft,
      proposals,
      selectionStep,
      showAllVotes,
      showThemes,
    } = this.props;
    if (proposals.length === 0) {
      return <p>{ this.getIntlMessage('proposal.empty') }</p>;
    }

    const classes = classNames({
      'media-list': true,
      opinion__list: true,
    });

    return (
      <Row componentClass="ul" className={classes}>
        {
          proposals.map((proposal) => {
            return (
              <ProposalPreview
                key={proposal.id}
                proposal={proposal}
                selectionStep={selectionStep}
                creditsLeft={creditsLeft}
                showAllVotes={showAllVotes}
                showThemes={showThemes}
              />
            );
          })
        }
      </Row>
    );
  },

});

export default ProposalList;
