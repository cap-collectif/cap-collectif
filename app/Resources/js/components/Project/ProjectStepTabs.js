// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

type Props = {
  steps: Array<Object>,
  currentStepId: string
};

type State = {
  translateX: number,
  showArrowRight: boolean,
  showArrowLeft: boolean,
  firstArrowDisplay: boolean,
  rightTest: boolean,
};

export class ProjectStepTabs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      translateX: 0,
      showArrowRight: false,
      showArrowLeft: false,
      firstArrowDisplay: true,
      rightTest: true,
    };
  }

  componentDidMount = () => {
    const stepTabsBar = document.getElementById('step-tabs__list');
    const activeTab = stepTabsBar && stepTabsBar.getElementsByClassName('active')[0];

    const getBoundingBar = stepTabsBar && stepTabsBar.getBoundingClientRect();
    const getBoundingActiveTab = activeTab && activeTab.getBoundingClientRect();

    const barLeft = getBoundingBar && getBoundingBar.left;
    const barRight = getBoundingBar && getBoundingBar.right;
    const activeTabLeft = getBoundingActiveTab && getBoundingActiveTab.left;
    const activeTabRight = getBoundingActiveTab && getBoundingActiveTab.right;

    const stepScrollNav = document.getElementById('step-tabs__scroll-nav');
    const stepTabsBarWidth = stepTabsBar && stepTabsBar.offsetWidth;
    const scrollNavWidth = stepScrollNav && stepScrollNav.offsetWidth;

    const stepTabsSvg = document.getElementById('step-tabs-svg');
    const getBoundingStepTabsSvg = stepTabsSvg && stepTabsSvg.getBoundingClientRect();
    const stepTabsSvgWidth = getBoundingStepTabsSvg.width;

    // move left
    if(barRight && activeTabRight && activeTabRight > barRight) {
      const diffRight = (barRight - activeTabRight);
      this.setState({
        translateX: diffRight - stepTabsSvgWidth,
      })
    }

    // if it doesn't move
    if(barRight &&
      activeTabRight &&
      barLeft &&
      stepTabsBarWidth &&
      scrollNavWidth &&
      activeTabLeft &&
      activeTabRight <= barRight &&
      activeTabLeft >= barLeft &&
      scrollNavWidth > stepTabsBarWidth) {
      this.setState({
        showArrowRight: true,
      })
    }
  };

  componentDidUpdate = (prevProps: Props, preState: State) => {
    const { firstArrowDisplay, translateX } = this.state;

    const stepTabsBar = document.getElementById('step-tabs__list');
    const getBoundingBar = stepTabsBar && stepTabsBar.getBoundingClientRect();
    const barRight = getBoundingBar && getBoundingBar.right;

    const stepScrollNav = document.getElementById('step-tabs__scroll-nav');
    const getBoundingScrollNav = stepScrollNav && stepScrollNav.getBoundingClientRect();
    const scrollNavRight = getBoundingScrollNav && getBoundingScrollNav.right;

    if(preState.translateX === 0 && this.state.translateX !== 0) {
      if(this.state.translateX < 0) {
        this.setState({
          showArrowLeft: true,
        })
      }
    }

    if(firstArrowDisplay) {
      if(scrollNavRight && barRight && ((scrollNavRight + translateX) > barRight)) {
        this.setState({
          showArrowRight: true,
          firstArrowDisplay: false,
        })
      }
    }
  };

  getClass = (stepId: string) => {
    const { currentStepId } = this.props;

    if(currentStepId === stepId) {
      return "active";
    }
  };

  getTranslateLeft = () => {
    const { translateX } = this.state;

    // trouver moyen reprendre const du didmount
    const stepTabsBar = document.getElementById('step-tabs__list');
    const stepTabsBarWidth = stepTabsBar && stepTabsBar.offsetWidth;
    const getBoundingBar = stepTabsBar && stepTabsBar.getBoundingClientRect();
    const barLeft = getBoundingBar && getBoundingBar.left;
    // fin repetition

    const stepScrollNav = document.getElementById('step-tabs__scroll-nav');
    const getBoundingScrollNav = stepScrollNav && stepScrollNav.getBoundingClientRect();
    const scrollNavLeft = getBoundingScrollNav && getBoundingScrollNav.left;

    const diffLeft = barLeft - scrollNavLeft;

    console.log(barLeft);
    console.warn(scrollNavLeft);
    console.log(diffLeft);
    console.error(stepTabsBarWidth);
    console.log(translateX);

    if(stepTabsBarWidth && diffLeft < stepTabsBarWidth) {
      this.setState({
        translateX: translateX + diffLeft,
        showArrowLeft: false,
        showArrowRight: true,
      })
    }

    if(stepTabsBarWidth && diffLeft > stepTabsBarWidth) {
      this.setState({
        translateX: translateX + stepTabsBarWidth,
        showArrowRight: true,
      })
    }

    if(stepTabsBarWidth && diffLeft === stepTabsBarWidth) {
      this.setState({
        translateX: translateX + stepTabsBarWidth,
        showArrowRight: true,
        showArrowLeft: false,
      })
    }
  };

  getTranslateRight = () => {
    const { translateX } = this.state;

    // trouver moyen reprendre const du didmount
    const stepTabsBar = document.getElementById('step-tabs__list');
    const stepTabsBarWidth = stepTabsBar && stepTabsBar.offsetWidth;
    const getBoundingBar = stepTabsBar && stepTabsBar.getBoundingClientRect();
    const barRight = getBoundingBar && getBoundingBar.right;
    // fin repetition

    const stepScrollNav = document.getElementById('step-tabs__scroll-nav');
    const getBoundingScrollNav = stepScrollNav && stepScrollNav.getBoundingClientRect();
    const scrollNavRight = getBoundingScrollNav && getBoundingScrollNav.right;

    const stepTabsSvg = document.getElementById('step-tabs-svg');
    const getBoundingStepTabsSvg = stepTabsSvg && stepTabsSvg.getBoundingClientRect();
    const stepTabsSvgWidth = getBoundingStepTabsSvg.width;

    // console.error(barRight);
    // console.warn(scrollNavRight);

    const diffRight = scrollNavRight - barRight;

    // console.log(translateX);
    // console.warn(stepTabsBarWidth);
    // console.log(diffRight);

    if(diffRight < stepTabsBarWidth) {
      this.setState({
        translateX: (translateX - diffRight) - stepTabsSvgWidth,
        showArrowRight: false,
        showArrowLeft: true,
      })
    }

    if(diffRight > stepTabsBarWidth) {
      this.setState({
        translateX: translateX - stepTabsBarWidth,
        showArrowLeft: true,
      })
    }

    if(diffRight === stepTabsBarWidth) {
      this.setState({
        translateX: translateX - stepTabsBarWidth,
        showArrowLeft: true,
        showArrowRight: false,
      })
    }
  };

  render() {
    const { steps } = this.props;
    const { translateX, showArrowLeft, showArrowRight } = this.state;

    const getTranslateX = translateX;
    const translation = `translateX(${getTranslateX}px)`;

    return (
      <div className="step-tabs">
        <div className="step-tabs__bar container">
          {showArrowLeft &&
            <div className="step-tabs__tab-prev">
              <a onClick={this.getTranslateLeft}>
                <i className="cap-arrow-65"></i>
              </a>
            </div>
          }
          {showArrowRight &&
            <div className="step-tabs__tab-next">
              <a onClick={this.getTranslateRight}>
                <i className="cap-arrow-66"></i>
              </a>
            </div>
          }
          <div className="step-tabs__list" id="step-tabs__list">
            <ul className="nav" id="step-tabs__scroll-nav" style={{ transform : translation }}>
              {steps.map((step,key) => (
                <li className={this.getClass(step.id)} key={key}>
                  <a href={step._links.show} className="d-flex">
                    <div className="navbar__step-nb"><span>{key+1}</span></div>
                    <div className="navbar__step">
                      <span className="navbar__step-title">{step.title}</span>
                      <p className="excerpt">
                        <FormattedMessage id={`step.status.${step.status}`}/>
                      </p>
                    </div>
                  </a>
                  <svg id="step-tabs-svg" height="80" width="21" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <filter id="f1" x="0" y="0" width="200%" height="200%">
                        <feOffset result="offOut" in="SourceGraphic" dx="0" dy="0" />
                        <feColorMatrix result = "matrixOut" in = "offOut" type = "matrix" values = "0.60 0 0 0 0 0 0.60 0 0 0 0 0 0.60 0 0 0 0 0 1 0 "/>
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
    )
  }
}



export default connect((state, props) => ({
  steps: state.project.projectsById[props.projectId].steps,
  currentStepId: state.project.currentProjectStepById
})
)(ProjectStepTabs);
