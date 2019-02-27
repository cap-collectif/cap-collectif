import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import ElementTitle from './../Element/ElementTitle';
import UserAvatar from '../../User/UserAvatar';
import VotePiechart from '../../Utils/VotePiechart';
import ChildrenModal from './ChildrenModal';
import SynthesisDisplayRules from '../../../services/SynthesisDisplayRules';
import SynthesisPourcentageTooltipLabel, {
  calculPourcentage,
} from './SynthesisPourcentageTooltipLabel';

class ViewElement extends React.Component {
  static propTypes = {
    element: PropTypes.object.isRequired,
    parent: PropTypes.object,
    settings: PropTypes.array.isRequired,
    onExpandElement: PropTypes.func.isRequired,
  };

  static defaultProps = {
    parent: null,
  };

  state = {
    showChildrenModal: false,
  };

  openOriginalContribution = () => {
    const { element } = this.props;
    window.open(element.linkedDataUrl);
    return false;
  };

  toggleChildrenModal = value => {
    const { element, onExpandElement } = this.props;
    onExpandElement(element);
    this.setState({
      showChildrenModal: value,
    });
  };

  renderAuthor = () => {
    const { element, settings } = this.props;
    if (SynthesisDisplayRules.getValueForRule(settings, 'display', 'author')) {
      return (
        <div className="synthesis__element__author">
          <UserAvatar className="pull-left" style={{ marginRight: '15px', marginTop: '15px' }} />
          <span>{element.authorName}</span>
        </div>
      );
    }
    return null;
  };

  renderPieChart = () => {
    const { element, settings } = this.props;
    const votes = element.votes;
    if (SynthesisDisplayRules.getValueForRule(settings, 'display', 'piechart')) {
      return (
        <div className="synthesis__element__votes">
          <VotePiechart ok={votes[1] || 0} nok={votes[-1] || 0} mitige={votes[0] || 0} />
          <p style={{ textAlign: 'center' }}>
            <FormattedMessage
              id="synthesis.vote.total"
              values={{
                nb: (votes[-1] || 0) + (votes[0] || 0) + (votes[1] || 0),
              }}
            />
          </p>
        </div>
      );
    }
    return null;
  };

  renderCounters = () => {
    const { element, settings } = this.props;
    if (SynthesisDisplayRules.getValueForRule(settings, 'display', 'counters')) {
      return (
        <div className="synthesis__element__counters">
          <FormattedMessage
            id="synthesis.counter.contributions"
            values={{ nb: element.publishedChildrenCount }}
          />
          {element.linkedDataUrl ? (
            <a
              style={{ marginLeft: '15px' }}
              href={element.linkedDataUrl}
              onClick={this.openOriginalContribution}>
              <FormattedMessage id="synthesis.counter.link" />
            </a>
          ) : null}
        </div>
      );
    }
    return null;
  };

  renderSubtitle = () => {
    const { element, settings } = this.props;
    if (
      SynthesisDisplayRules.getValueForRule(settings, 'display', 'subtitle') &&
      element.subtitle
    ) {
      return <p className="small excerpt">{element.subtitle}</p>;
    }
    return null;
  };

  renderPercentage = () => {
    const { element, parent, settings } = this.props;
    if (SynthesisDisplayRules.getValueForRule(settings, 'display', 'percentage') && parent) {
      return (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip>
              <SynthesisPourcentageTooltipLabel element={element} parent={parent} />
            </Tooltip>
          }>
          <span className="small excerpt pull-right">{calculPourcentage(element, parent)}%</span>
        </OverlayTrigger>
      );
    }
    return null;
  };

  renderDescription = () => {
    const { element } = this.props;
    if (element.description) {
      return <p className="synthesis__element__description">{element.description}</p>;
    }
  };

  renderTitle = () => {
    const { element, settings } = this.props;
    const childrenModal = SynthesisDisplayRules.getValueForRule(
      settings,
      'display',
      'childrenInModal',
    );
    return (
      <ElementTitle
        className="element__title"
        element={element}
        hasLink={false}
        style={SynthesisDisplayRules.buildStyle(settings)}
        onClick={childrenModal ? this.toggleChildrenModal.bind(null, true) : null}
      />
    );
  };

  renderAsProgressBar = () => {
    const { element, parent } = this.props;
    if (parent) {
      return (
        <div className="synthesis__element">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>
                <SynthesisPourcentageTooltipLabel element={element} parent={parent} />
              </Tooltip>
            }>
            <div className="synthesis__element__bar">
              <span
                className="synthesis__element__bar__value"
                style={{ width: `${calculPourcentage(element, parent)}%` }}
              />
              {this.renderTitle()}
            </div>
          </OverlayTrigger>
        </div>
      );
    }
    return null;
  };

  render() {
    const { element, settings } = this.props;
    return (
      <div
        className="synthesis__element"
        style={SynthesisDisplayRules.buildStyle(settings, 'containerStyle')}>
        {this.renderAuthor()}
        <div style={SynthesisDisplayRules.buildStyle(settings)}>
          {SynthesisDisplayRules.getValueForRule(settings, 'display', 'asProgressBar') ? (
            this.renderAsProgressBar()
          ) : (
            <p>
              {this.renderTitle()}
              {this.renderPercentage()}
            </p>
          )}
          {this.renderSubtitle()}
        </div>
        {this.renderCounters()}
        {this.renderPieChart()}
        {this.renderDescription()}
        <ChildrenModal
          elements={element.children}
          show={this.state.showChildrenModal}
          toggle={this.toggleChildrenModal}
        />
      </div>
    );
  }
}

export default ViewElement;
