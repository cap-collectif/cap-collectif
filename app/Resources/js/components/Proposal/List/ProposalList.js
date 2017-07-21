import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Row } from 'react-bootstrap';
import ProposalPreview from '../Preview/ProposalPreview';
import VisibilityBox from '../../Utils/VisibilityBox';

export const ProposalList = React.createClass({
  propTypes: {
    proposals: PropTypes.array.isRequired,
    step: PropTypes.object.isRequired,
    showThemes: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      showThemes: false,
    };
  },

  render() {
    const { step, showThemes } = this.props;

    let { proposals } = this.props;

    if (!Array.isArray(proposals)) {
      proposals = Object.keys(proposals).map(k => proposals[k]);
    }

    if (proposals.length === 0) {
      return (
        <p
          className={classNames({ 'p--centered': true })}
          style={{ 'margin-bottom': '40px' }}>
          {<FormattedMessage id="proposal.private.empty" />}
        </p>
      );
    }

    const classes = classNames({
      'media-list': true,
      opinion__list: true,
    });

    let privateProposals = [];
    let publicProposals = proposals;

    if (typeof proposals[0].visible !== 'undefined') {
      privateProposals = proposals.filter(proposal => !proposal.visible);
      publicProposals = proposals.filter(proposal => proposal.visible);
    }

    return (
      <div>
        {publicProposals.length > 0 &&
          <Row componentClass="ul" className={classes}>
            {publicProposals.map(proposal =>
              <ProposalPreview
                key={proposal.id}
                proposal={proposal}
                step={step}
                showThemes={showThemes}
              />,
            )}
          </Row>}
        {privateProposals.length > 0 &&
          <VisibilityBox enabled>
            <Row componentClass="ul" className={classes}>
              {privateProposals.map(proposal =>
                <ProposalPreview
                  key={proposal.id}
                  proposal={proposal}
                  step={step}
                  showThemes={showThemes}
                />,
              )}
            </Row>
          </VisibilityBox>}
      </div>
    );
  },
});

export default ProposalList;
