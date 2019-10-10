// @flow
import React, { PureComponent } from 'react';
import { Badge, Button } from 'react-bootstrap';
import styled, { css } from 'styled-components';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { type GlobalState } from '../../types';
import colors from '../../utils/colors';
import type { ProjectStepTabs_project, StepStatus } from '~relay/ProjectStepTabs_project.graphql';

export type Props = {
  project: ProjectStepTabs_project,
  currentStepId: ?string,
  projectId: string,
  intl: IntlShape,
};

type State = {
  translateX: number,
  showArrowRight: boolean,
  showArrowLeft: boolean,
  firstArrowDisplay: boolean,
};

const StepExcerptBadge = styled(Badge)`
  border-radius: 3px;
  ${({ activeTab }: { activeTab: boolean }) =>
    !activeTab &&
    css`
      background-color: ${colors.borderColor} !important;
      color: ${colors.darkGray};
    `}
`;

const getNavValues = () => {
  const stepTabsBar = document.getElementById('step-tabs-list');
  const stepTabsBarWidth: number = stepTabsBar ? stepTabsBar.offsetWidth : 0;
  const getBoundingBar: ?Object = stepTabsBar ? stepTabsBar.getBoundingClientRect() : null;
  const barRight: number = getBoundingBar ? getBoundingBar.right : 0;
  const barLeft: number = getBoundingBar ? getBoundingBar.left : 0;

  const activeTab: ?Object = stepTabsBar && stepTabsBar.getElementsByClassName('active')[0];
  const getBoundingActiveTab: ?Object = activeTab && activeTab.getBoundingClientRect();
  const activeTabLeft: number = getBoundingActiveTab ? getBoundingActiveTab.left : 0;
  const activeTabRight: number = getBoundingActiveTab ? getBoundingActiveTab.right : 0;

  const stepScrollNav: ?Object = document.getElementById('step-tabs-scroll-nav');
  const scrollNavWidth: number = stepScrollNav ? stepScrollNav.offsetWidth : 0;
  const getBoundingScrollNav: ?Object = stepScrollNav && stepScrollNav.getBoundingClientRect();
  const scrollNavRight: number = getBoundingScrollNav ? getBoundingScrollNav.right : 0;
  const scrollNavLeft: number = getBoundingScrollNav ? getBoundingScrollNav.left : 0;

  const stepTabsSvg: ?Object = document.getElementById('step-tabs-svg');
  const getBoundingStepTabsSvg: ?Object = stepTabsSvg && stepTabsSvg.getBoundingClientRect();
  const stepTabsSvgWidth: number = getBoundingStepTabsSvg ? getBoundingStepTabsSvg.width : 0;

  return {
    stepTabsBarWidth,
    stepScrollNav,
    stepTabsBar,
    scrollNavWidth,
    scrollNavRight,
    scrollNavLeft,
    stepTabsSvgWidth,
    activeTab,
    barRight,
    barLeft,
    activeTabLeft,
    activeTabRight,
  };
};

export class ProjectStepTabs extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      translateX: 0,
      showArrowRight: false,
      showArrowLeft: false,
      firstArrowDisplay: true,
    };
  }

  componentDidMount = () => {
    const {
      barRight,
      barLeft,
      activeTab,
      activeTabRight,
      activeTabLeft,
      scrollNavWidth,
      stepTabsSvgWidth,
      stepTabsBarWidth,
    } = getNavValues();

    // move left
    if (activeTabRight > barRight) {
      const diffRight = barRight - activeTabRight;
      this.setState({ translateX: diffRight - stepTabsSvgWidth });
    }

    // if it doesn't move
    if (
      (activeTabRight <= barRight &&
        activeTabLeft >= barLeft &&
        scrollNavWidth > stepTabsBarWidth) ||
      (scrollNavWidth > stepTabsBarWidth && !activeTab)
    ) {
      this.setState({ showArrowRight: true });
    }
  };

  componentDidUpdate = (prevProps: Props, preState: State) => {
    const { firstArrowDisplay, translateX } = this.state;
    const { barRight, scrollNavRight, activeTabRight } = getNavValues();

    const nextArrow: ?Object = document.getElementById('step-tabs-tab-next');
    const nextArrowWidth: number = nextArrow ? nextArrow.getBoundingClientRect().width : 0;
    const nextArrowRight: number = nextArrow ? nextArrow.getBoundingClientRect().right : 0;

    if (preState.translateX === 0 && this.state.translateX !== 0) {
      if (this.state.translateX < 0) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ showArrowLeft: true });
      }
    }

    if (firstArrowDisplay) {
      if (scrollNavRight + translateX > barRight) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ showArrowRight: true, firstArrowDisplay: false });
      }
    }

    if (
      nextArrowRight === barRight &&
      activeTabRight > barRight &&
      preState.showArrowRight === false &&
      this.state.showArrowRight !== false
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ translateX: translateX - nextArrowWidth });
    }
  };

  getClass = (stepId: string) => {
    const { currentStepId } = this.props;

    if (currentStepId === stepId) {
      return 'active';
    }
  };

  getTranslateLeft = () => {
    const { translateX } = this.state;
    const { stepTabsBarWidth, barLeft, scrollNavLeft } = getNavValues();

    const diffLeft = barLeft - scrollNavLeft;

    if (diffLeft < stepTabsBarWidth) {
      this.setState({
        translateX: translateX + diffLeft,
        showArrowLeft: false,
        showArrowRight: true,
      });
    }

    if (diffLeft > stepTabsBarWidth) {
      this.setState({
        translateX: translateX + stepTabsBarWidth,
        showArrowRight: true,
      });
    }

    if (diffLeft === stepTabsBarWidth) {
      this.setState({
        translateX: translateX + stepTabsBarWidth,
        showArrowRight: true,
        showArrowLeft: false,
      });
    }
  };

  getTranslateRight = () => {
    const { translateX } = this.state;
    const { stepTabsBarWidth, scrollNavRight, barRight, stepTabsSvgWidth } = getNavValues();

    const diffRight = scrollNavRight - barRight;

    if (diffRight < stepTabsBarWidth) {
      this.setState({
        translateX: translateX - diffRight - stepTabsSvgWidth,
        showArrowRight: false,
        showArrowLeft: true,
      });
    }

    if (diffRight > stepTabsBarWidth) {
      this.setState({
        translateX: translateX - stepTabsBarWidth,
        showArrowLeft: true,
      });
    }

    if (diffRight === stepTabsBarWidth) {
      this.setState({
        translateX: translateX - stepTabsBarWidth,
        showArrowLeft: true,
        showArrowRight: false,
      });
    }
  };

  renderStepStatus(status: ?StepStatus) {
    if (status === 'OPENED') {
      return <FormattedMessage id="step.status.open" />;
    }
    if (status === 'FUTURE') {
      return <FormattedMessage id="step.status.future" />;
    }
    if (status === 'CLOSED') {
      return <FormattedMessage id="step.status.closed" />;
    }
  }

  render() {
    const { project, intl } = this.props;

    if (!project || project.steps.length <= 1) {
      return null;
    }

    const { translateX, showArrowLeft, showArrowRight } = this.state;
    const translation = `translateX(${translateX}px)`;

    return (
      <div className="step-tabs hidden-print">
        <div className="step-tabs__bar container">
          <div id="step-tabs-content" className="position-relative">
            {showArrowLeft && (
              <div className="step-tabs__tab-prev" id="step-tabs-tab-prev">
                <Button bsStyle="link" onClick={this.getTranslateLeft}>
                  <i className="cap-arrow-65" />
                </Button>
              </div>
            )}
            {showArrowRight && (
              <div className="step-tabs__tab-next" id="step-tabs-tab-next">
                <Button bsStyle="link" onClick={this.getTranslateRight}>
                  <i className="cap-arrow-66" />
                </Button>
              </div>
            )}
            <div className="step-tabs__list" id="step-tabs-list">
              <ul className="nav" id="step-tabs-scroll-nav" style={{ transform: translation }}>
                {project.steps
                  .filter(step => step.enabled)
                  .map((step, key) => (
                    <li
                      className={this.getClass(step.id)}
                      key={key}
                      title={`${step.label} - ${intl.formatMessage({
                        id: 'global.active.step',
                      })}`}>
                      <a href={step.url} className="d-flex">
                        <div className="navbar__step-nb">
                          <span>{key + 1}</span>
                        </div>

                        <div className="navbar__step">
                          <span className="navbar__step-title">
                            <span className="navbar__step-nb_small">{key + 1}.</span>
                            {step.label}
                          </span>
                          <p className="excerpt">
                            {step.type !== 'presentation' && (
                              <StepExcerptBadge activeTab={step.status === 'OPENED'}>
                                {this.renderStepStatus(step.status)}
                              </StepExcerptBadge>
                            )}
                          </p>
                        </div>
                      </a>
                      <svg
                        id="step-tabs-svg"
                        height="80"
                        width="21"
                        xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <filter id="f1" x="0" y="0" width="200%" height="200%">
                            <feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" />
                            <feColorMatrix
                              result="matrixOut"
                              in="offOut"
                              type="matrix"
                              values="0.60 0 0 0 0 0 0.60 0 0 0 0 0 0.60 0 0 0 0 0 1 0 "
                            />
                            <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="1" />
                            <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                          </filter>
                        </defs>
                        <polygon points="0,0, 0,80,20 40" filter="url(#f1)" />
                      </svg>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  currentStepId: state.project.currentProjectStepById,
});

const container = connect(mapStateToProps)(injectIntl(ProjectStepTabs));

export default createFragmentContainer(container, {
  project: graphql`
    fragment ProjectStepTabs_project on Project {
      steps {
        id
        status
        label
        type
        url
        enabled
      }
    }
  `,
});
