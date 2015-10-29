import ElementTitle from './ElementTitle';
import UserAvatar from '../User/UserAvatar';
import VotePiechart from '../Utils/VotePiechart';
import ChildrenModal from './ChildrenModal';
import SynthesisDisplayRules from '../../services/SynthesisDisplayRules';

const FormattedMessage = ReactIntl.FormattedMessage;
const OverlayTrigger = ReactBootstrap.OverlayTrigger;
const Tooltip = ReactBootstrap.Tooltip;

const ViewElement = React.createClass({
  propTypes: {
    element: React.PropTypes.object.isRequired,
    parent: React.PropTypes.object,
    settings: React.PropTypes.array.isRequired,
    onExpandElement: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      parent: null,
    };
  },

  getInitialState() {
    return {
      showChildrenModal: false,
    };
  },

  toggleChildrenModal(value) {
    this.props.onExpandElement(this.props.element);
    this.setState({
      showChildrenModal: value,
    });
  },

  openOriginalContribution() {
    window.open(this.props.element.linkedDataUrl);
    return false;
  },

  renderAuthor() {
    if (SynthesisDisplayRules.getValueForRule(this.props.settings, 'display', 'author')) {
      return (
        <div className="synthesis__element__author">
          <UserAvatar className="pull-left" style={{marginRight: '15px', marginTop: '15px'}} />
          <span>
            {this.props.element.authorName}
          </span>
        </div>
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
        <div className="synthesis__element__counters">
          <FormattedMessage
            message={this.getIntlMessage('counter.contributions')}
            nb={this.props.element.publishedChildrenCount}
          />
          {this.props.element.linkedDataUrl
            ? <a
                style={{marginLeft: '15px'}}
                href={this.props.element.linkedDataUrl}
                onClick={this.openOriginalContribution}
              >
                {this.getIntlMessage('counter.link')}
              </a>
            : null
          }
        </div>
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
      const percentage = Math.round(
        (this.props.element.childrenElementsNb / this.props.parent.childrenElementsNb) * 1000
      ) / 10;
      const tooltip = (
        <Tooltip>
          <FormattedMessage
            message={this.getIntlMessage('percentage.tooltip')}
            contributions={this.props.element.publishedChildrenCount}
            score={this.props.element.childrenScore}
            percentage={percentage}
          />
        </Tooltip>
      );
      return (
        <OverlayTrigger placement="top" overlay={tooltip}>
          <span className="small excerpt pull-right">
            {percentage}%
          </span>
        </OverlayTrigger>
      );
    }
    return null;
  },

  renderDescription() {
    if (this.props.element.description) {
      return (
        <p className="synthesis__element__description">
          {this.props.element.description}
        </p>
      );
    }
  },

  renderTitle() {
    const childrenModal = SynthesisDisplayRules.getValueForRule(this.props.settings, 'display', 'childrenInModal');
    return (
      <ElementTitle
        className="element__title"
        element={this.props.element}
        link={false}
        onClick={childrenModal ? this.toggleChildrenModal.bind(null, true) : null}
      />
    );
  },

  renderAsProgressBar() {
    if (this.props.parent) {
      const percentage = Math.round(
        (this.props.element.childrenElementsNb / this.props.parent.parentChildrenElementsNb) * 1000
      ) / 10;
      const tooltip = (
        <Tooltip>
          <FormattedMessage
            message={this.getIntlMessage('percentage.tooltip')}
            contributions={this.props.element.publishedChildrenCount}
            score={this.props.element.childrenScore}
            percentage={percentage}
            />
        </Tooltip>
      );
      return (
        <div className="synthesis__element">
          <OverlayTrigger placement="top" overlay={tooltip}>
            <div className="synthesis__element__bar">
              <span className="synthesis__element__bar__value" style={{width: percentage + '%'}} />
              {this.renderTitle()}
            </div>
          </OverlayTrigger>
        </div>
      );
    }
    return null;
  },

  render() {
    return (
      <div className="synthesis__element" style={SynthesisDisplayRules.buildStyle(this.props.settings, 'containerStyle')}>
        {this.renderAuthor()}
        <div style={SynthesisDisplayRules.buildStyle(this.props.settings)}>
          {
            SynthesisDisplayRules.getValueForRule(this.props.settings, 'display', 'asProgressBar')
              ? this.renderAsProgressBar()
              : <p>
                  {this.renderTitle()}
                  {this.renderPercentage()}
                </p>
          }
          {this.renderSubtitle()}
        </div>
        {this.renderCounters()}
        {this.renderPieChart()}
        {this.renderDescription()}
        <ChildrenModal elements={this.props.element.children} show={this.state.showChildrenModal} toggle={this.toggleChildrenModal} />
      </div>
    );
  },

});

export default ViewElement;
