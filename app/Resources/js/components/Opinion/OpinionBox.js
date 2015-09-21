import {VOTE_WIDGET_DISABLED, VOTE_WIDGET_BOTH} from '../../constants/VoteConstants';

import OpinionPreview from './OpinionPreview';
import OpinionButtons from './OpinionButtons';
import OpinionAppendices from './OpinionAppendices';
import OpinionBody from './OpinionBody';
import VotePiechart from '../Utils/VotePiechart';
import UserAvatar from '../User/UserAvatar';
import VotesBar from '../Utils/VotesBar';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const Well = ReactBootstrap.Well;

const FormattedMessage = ReactIntl.FormattedMessage;

const OpinionBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    isReportingEnabled: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getMaxVotesValue() {
    return this.getOpinionType().votesThreshold;
  },

  getOpinionType() {
    return this.isVersion() ? this.props.opinion.parent.type : this.props.opinion.type;
  },

  renderVotesHelpText() {
    const helpText = this.getOpinionType().votesHelpText;
    if (helpText) {
      return <Well bsSize="small" style={{marginBottom: '10px', fontSize: '14px'}}>{helpText}</Well>;
    }
  },

  renderUserAvatarVotes() {
    const opinion = this.props.opinion;
    let votes = opinion.votes;
    let moreVotes = null;

    if (opinion.votes.length > 5) {
      votes = opinion.votes.slice(0, 5);
      moreVotes = opinion.votes.length - 5;
    }

    return (
      <div style={{paddingTop: '20px'}}>
      {
        votes.map((vote) => {
          return <UserAvatar key={vote.user.id} user={vote.user} style={{marginRight: 5}} />;
        })
      }
      {moreVotes !== null
        ? <span>+ {moreVotes}</span>
        : <span />
      }
      </div>
    );
  },

  renderPieChart() {
    const opinion = this.props.opinion;
    return (
      <VotePiechart top={20} height={180} ok={opinion.votes_ok} nok={opinion.votes_nok}
                          mitige={opinion.votes_mitige}/>
    );
  },

  renderVotesBar() {
    const opinion = this.props.opinion;
    return (
      <div>
        {this.getOpinionType().votesThreshold ?
          <VotesBar max={this.getOpinionType().votesThreshold} value={opinion.votes_ok}
                    helpText={this.getOpinionType().votesThresholdHelpText}/>
          : null}
        {this.renderUserAvatarVotes()}
        <div><FormattedMessage message={this.getIntlMessage('global.votes')} num={opinion.votes.length}/></div>
      </div>
    );
  },

  renderVotes() {
    const opinion = this.props.opinion;
    const widgetType = this.getOpinionType().voteWidgetType;
    if (widgetType !== VOTE_WIDGET_DISABLED && (opinion.votes.length > 0 || this.getOpinionType().votesThreshold)) {
      if (opinion.votes.length > 0 && widgetType === VOTE_WIDGET_BOTH) {
        return (
          <Row style={{borderTop: '1px solid #ddd'}}>
            <Col sm={12} md={4}>
              {this.renderPieChart()}
            </Col>
            <Col sm={12} md={7} style={{paddingTop: '15px'}}>
              {this.renderVotesBar()}
            </Col>
          </Row>
        );
      }
      return (
        <Row style={{borderTop: '1px solid #ddd'}}>
          <Col sm={12} mdOffset={2} md={8} style={{paddingTop: '15px'}}>
            {this.renderVotesBar()}
          </Col>
        </Row>
      );
    }
    return null;
  },

  render() {
    const opinion = this.props.opinion;
    const color = this.getOpinionType().color;
    const backLink = this.isVersion() ? opinion.parent._links.show : opinion._links.type;
    const backTitle = this.getOpinionType().title;

    const colorClass = 'opinion opinion--' + color + ' opinion--current';
    return (
      <div className="block block--bordered opinion__details">
        <div className={colorClass}>
          <div className="opinion__header opinion__header--centered">
            <a className="neutral-hover pull-left h4 opinion__header__back" href={backLink}>
              <i className="cap cap-arrow-1"></i>
              <span className="hidden-xs hidden-sm"> {this.getIntlMessage('global.back')}</span>
            </a>
            <h2 className="h4 opinion__header__title"> {backTitle}</h2>
          </div>
          <OpinionPreview opinion={opinion} link={false} />
        </div>
        <OpinionAppendices opinion={opinion} />
        <div className="opinion__description">
          <OpinionBody opinion={opinion} />
          <div className="opinion__buttons" style={{marginTop: '15px', marginBottom: '15px'}}>
            {this.renderVotesHelpText()}
            <OpinionButtons {...this.props} opinion={opinion} />
          </div>
          {this.renderVotes()}
        </div>
      </div>
    );
  },

  isVersion() {
    return this.props.opinion.parent ? true : false;
  },


});

export default OpinionBox;
