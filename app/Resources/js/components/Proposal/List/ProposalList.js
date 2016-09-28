import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import ProposalPreview from '../Preview/ProposalPreview';
import { Row } from 'react-bootstrap';
import VisibilityBox from '../../Utils/VisibilityBox';
import { connect } from 'react-redux';

export const ProposalList = React.createClass({
  propTypes: {
    proposals: PropTypes.array.isRequired,
    selectionStep: PropTypes.object,
    creditsLeft: PropTypes.number,
    showAllVotes: PropTypes.bool,
    showThemes: PropTypes.bool,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      creditsLeft: null,
      selectionStep: null,
      showAllVotes: false,
      showThemes: false,
      user: null,
    };
  },

  render() {
    const {
      creditsLeft,
      proposals,
      selectionStep,
      showAllVotes,
      showThemes,
      user,
    } = this.props;

    if (proposals.length === 0) {
      return (<p className={classNames({ 'p--centered': true })} style={{ 'margin-bottom': '40px' }}>{ this.getIntlMessage('proposal.private.empty') }</p>);
    }

    const classes = classNames({
      'media-list': true,
      opinion__list: true,
    });

    const privateProposals = proposals.filter((proposal) => proposal.private);
    const publicProposals = proposals.filter((proposal) => !proposal.private);

    return (
      <div>
        {
          publicProposals.length > 0 &&
          <Row componentClass="ul" className={classes}>
            {
              publicProposals.map((proposal) => {
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
        }
        {
          privateProposals.length > 0 && user &&
          <VisibilityBox enabled>
            <Row componentClass="ul" className={classes}>
              {
                privateProposals.map((proposal) => {
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
          </VisibilityBox>
        }
      </div>
    );
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(ProposalList);
