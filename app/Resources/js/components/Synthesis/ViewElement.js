import ElementTitle from './ElementTitle';
import UserAvatar from '../User/UserAvatar';
import VotePiechart from '../Utils/VotePiechart';
import SynthesisDisplayRules from '../../services/SynthesisDisplayRules';

const FormattedMessage = ReactIntl.FormattedMessage;

const ViewElement = React.createClass({
  propTypes: {
    element: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object,
    settings: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      parent: null,
    };
  },

  renderAuthor() {
    if (SynthesisDisplayRules.getValueForRule(this.props.settings, 'display', 'author')) {
      return (
        <UserAvatar user={this.props.element.author} />
      );
    }
    return null;
  },

  renderPieChart() {
    const votes = this.props.element.votes;
    if (SynthesisDisplayRules.getValueForRule(this.props.settings, 'display', 'piechart')) {
      return (
        <div className="synthesis__element__votes">
          <VotePiechart
            top={20}
            height={180}
            ok={votes[1] || 0}
            nok={votes[-1] || 0}
            mitige={votes[0] || 0}
          />
          <p style={{textAlign: 'center'}}>
            <FormattedMessage
              message={this.getIntlMessage('vote.total')}
              nb={(votes[-1] || 0) + (votes[0] || 0) + (votes[1] || 0)}
            />
          </p>
        </div>
      );
    }
    return null;
  },

  renderCounters() {
    if (SynthesisDisplayRules.getValueForRule(this.props.settings, 'display', 'counters')) {
      return (
        <span className="synthesis__element__counters">
          <FormattedMessage
            message={this.getIntlMessage('counter.contributions')}
            nb={this.props.element.publishedChildrenCount}
          />
        </span>
      );
    }
    return null;
  },

  renderSubtitle() {
    if (SynthesisDisplayRules.getValueForRule(this.props.settings, 'display', 'subtitle') && this.props.element.subtitle) {
      return (
        <p className="small excerpt">
          {this.props.element.subtitle}
        </p>
      );
    }
    return null;
  },

  renderPercentage() {
    if (SynthesisDisplayRules.getValueForRule(this.props.settings, 'display', 'percentage') && this.props.parent) {
      const percentage = Math.round(this.props.element.publishedChildrenCount / this.props.parent.publishedChildrenCount * 100);
      return (
        <span className="small excerpt pull-right">
          {percentage}%
        </span>
      );
    }
    return null;
  },

  renderElementBody() {
    if (this.props.element.body) {
      return (
        <div className="synthesis__element__body" dangerouslySetInnerHTML={{__html: this.props.element.body}} />
      );
    }
  },

  renderAsProgressBar() {
    if (this.props.parent) {
      const percentage = Math.round(this.props.element.publishedChildrenCount / this.props.parent.publishedChildrenCount * 100);
      return (
        <div className="synthesis__element">
          <div className="synthesis__element__bar">
            <span className="synthesis__element__bar__value" style={{width: percentage + '%'}} />
            <ElementTitle className="element__title" element={this.props.element} link={false}/>
          </div>
        </div>
      );
    }
    return null;
  },

  render() {
    if (SynthesisDisplayRules.getValueForRule(this.props.settings, 'display', 'asProgressBar')) {
      return this.renderAsProgressBar();
    }
    return (
      <div className="synthesis__element" style={SynthesisDisplayRules.buildStyle(this.props.settings, 'containerStyle')}>
        {this.renderAuthor()}
        <div style={SynthesisDisplayRules.buildStyle(this.props.settings)}>
          <p>
            <ElementTitle element={this.props.element} link={false} />
            {this.renderPercentage()}
          </p>
          {this.renderSubtitle()}
        </div>
        {this.renderCounters()}
        {this.renderPieChart()}
        {this.renderElementBody()}
      </div>
    );
  },

});

export default ViewElement;
