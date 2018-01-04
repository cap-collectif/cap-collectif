// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

type Props = {
  steps: Array<Object>,
  currentStepId: string
};

export class ProjectStepTabs extends React.Component<Props> {
  componentDidMount = () => {
    const stepTabsBar = document.getElementById('step-tabs__list');
    const allTabs = stepTabsBar.getElementsByTagName('li');
    const activeTab = stepTabsBar.getElementsByClassName('active')[0];

    const getBoundingBar = stepTabsBar.getBoundingClientRect();
    const getBoundingActiveTab = activeTab.getBoundingClientRect();
    const barLeft = getBoundingBar.left;
    const barRight = getBoundingBar.right;
    const activeTabLeft = getBoundingActiveTab.left;
    const navWidth = stepTabsBar.offsetWidth;
    const activeTabRight = getBoundingActiveTab.right;

    console.log(barLeft, barRight, activeTabLeft, activeTabRight);

    if(activeTabLeft < barLeft) {
      // décaler à droite
    }

    if(activeTabRight > barRight) {
      // décaler à gauche
    }


    let totalTabsWidth = 0;
    for (let i = 0; i < allTabs.length; i++) {
      const tabsWidth = allTabs[i].offsetWidth;
      totalTabsWidth += tabsWidth;
    }
    const widthDiff = totalTabsWidth - navWidth;
    if (widthDiff > 0) {
      // console.warn(widthDiff);
    }
  };

  getClass = (stepId: string) =>{
    const { currentStepId } = this.props;

    if(currentStepId === stepId) {
      return "active";
    }
  };

  render() {
    const { steps } = this.props;

    return (
      <div className="step-tabs">
        <div className="step-tabs__bar container">
          <div className="step-tabs__tab-prev">
            <a href="">
              <i className="cap-arrow-65"></i>
            </a>
          </div>
          <div className="step-tabs__tab-next">
            <a href="">
              <i className="cap-arrow-66"></i>
            </a>

          </div>
          <div className="step-tabs__list" id="step-tabs__list">
            <ul className="nav">
              {steps.map((step,key) => (
                <li className={this.getClass(step.id)}>
                  <a href={step._links.show} className="d-flex">
                    <div className="navbar__step-nb"><span>{key+1}</span></div>
                    <div className="navbar__step">
                      <span className="navbar__step-title">{step.title}</span>
                      <p className="excerpt">
                        <FormattedMessage id={`step.status.${step.status}`}/>
                      </p>
                    </div>
                  </a>
                  <svg height="80" width="21" xmlns="http://www.w3.org/2000/svg">
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
