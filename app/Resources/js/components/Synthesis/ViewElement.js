import FormattedText from '../../services/FormattedText';

import ElementTitle from './ElementTitle';
import ElementCaret from './ElementCaret';
import UserAvatar from '../User/UserAvatar';
import VotePiechart from '../Utils/VotePiechart';

const FormattedMessage = ReactIntl.FormattedMessage;

const ViewElement = React.createClass({
  propTypes: {
    element: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object.isRequired,
    settings: React.PropTypes.array.isRequired,
    expanded: React.PropTypes.bool.isRequired,
    onToggleExpand: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      onExpand: null,
    };
  },

  getValueForDisplayRule(name) {
    return this.props.settings.some((setting) => {
      return setting.rules.some((rule) => {
        if (rule.category === 'display' && rule.name === name) {
          return rule.value;
        }
        return false;
      });
    });
  },

  buildStyle() {
    const style = {};
    this.props.settings.map((setting) => {
      setting.rules.map((rule) => {
        if (rule.category === 'style') {
          style[rule.name] = rule.value;
        }
      });
    });
    return style;
  },

  renderAuthor() {
    if (this.getValueForDisplayRule('author')) {
      return (
        <UserAvatar user={this.props.element.author} />
      );
    }
    return null;
  },

  renderPieChart() {
    const votes = this.props.element.votes;
    if (this.getValueForDisplayRule('piechart')) {
      return (
        <div className="synthesis__element__votes">
          <VotePiechart
            top={20}
            height={180}
            ok={votes[1]}
            nok={votes[-1]}
            mitige={votes[0]}
          />
          <p style={{textAlign: 'center'}}>
            <FormattedMessage
              message={this.getIntlMessage('vote.total')}
              nb={votes[-1] + votes[0] + votes[1]}
            />
          </p>
        </div>
      );
    }
    return null;
  },

  renderCounters() {
    if (this.getValueForDisplayRule('counters')) {
      return (
        <span className="synthesis__element__counters">
          <FormattedMessage
            message={this.getIntlMessage('counter.contributions')}
            nb={this.props.element.totalChildrenCount}
          />
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
    const percentage = this.props.parent.totalChildrenCount / this.props.element.totalChildrenCount * 100;
    return (
      <div className="synthesis__element">
        <div className="synthesis__element__bar">
          <span className="synthesis__element__bar__value" style={{width: percentage + '%'}}>
            <ElementTitle element={this.props.element} link={false} />
          </span>
        </div>
      </div>
    );
  },

  render() {
    if (this.getValueForDisplayRule('asProgressBar')) {
      return this.renderAsProgressBar();
    }
    return (
      <div className="synthesis__element">
        {this.renderAuthor()}
        <p style={this.buildStyle()}>
          <ElementTitle element={this.props.element} link={false} />
          <ElementCaret
            element={this.props.element}
            expanded={this.props.expanded}
            onToggleExpand={this.props.onToggleExpand}
            style={{marginLeft: '5px'}}
          />
        </p>
        {this.renderCounters()}
        {this.renderPieChart()}
        {this.renderElementBody()}
      </div>
    );
  },

});

export default ViewElement;
