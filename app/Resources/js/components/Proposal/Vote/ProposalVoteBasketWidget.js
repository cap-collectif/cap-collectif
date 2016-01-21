import React from 'react';
import {IntlMixin, FormattedNumber} from 'react-intl';
import {Nav, Navbar, Button, ProgressBar} from 'react-bootstrap';

const ProposalVoteBasketWidget = React.createClass({
  propTypes: {
    totalBudget: React.PropTypes.number.isRequired,
    creditsLeft: React.PropTypes.number.isRequired,
    votesPageUrl: React.PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const creditsSpent = this.props.totalBudget - this.props.creditsLeft;
    const percentage = creditsSpent > 0 && this.props.totalBudget > 0
      ? this.props.totalBudget > creditsSpent * 100
      : 0;
    return (
      <Navbar fixedTop className="proposal-vote__widget hidden-xs">
        <Nav>
          <li className="navbar-text">
            {this.getIntlMessage('project.votes.widget.brand')}
          </li>
          <li className="navbar-text widget__counter">
            <p className="widget__counter__label">
              {this.getIntlMessage('project.votes.widget.budget')}
            </p>
            <span className="widget__counter__value">
              <FormattedNumber value={this.props.totalBudget} style="currency" currency="EUR" />
            </span>
          </li>
          <li className="navbar-text widget__counter">
            <p className="widget__counter__label">
              {this.getIntlMessage('project.votes.widget.left')}
            </p>
            <span className="widget__counter__value">
              <FormattedNumber value={this.props.creditsLeft} style="currency" currency="EUR" />
            </span>
          </li>
          <li className="navbar-text widget__counter">
            <p className="widget__counter__label">
              {this.getIntlMessage('project.votes.widget.spent')}
            </p>
            <span className="widget__counter__value">
              <FormattedNumber value={creditsSpent} style="currency" currency="EUR" />
            </span>
          </li>
        </Nav>
        <Button bsStyle="default" className="btn--outline navbar-btn pull-right" href={this.props.votesPageUrl} >
          {this.getIntlMessage('proposal.details') }
        </Button>
        <Nav pullRight>
          <li className="navbar-text widget__progress-bar">
            <ProgressBar bsStyle="success" now={percentage} label="%(percent)s%" />
          </li>
        </Nav>
      </Navbar>
    );
  },

});

export default ProposalVoteBasketWidget;
