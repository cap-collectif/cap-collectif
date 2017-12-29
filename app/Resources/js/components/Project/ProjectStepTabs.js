import React from 'react';

type Props = {
  projectSteps: Object,
};

export class ProjectStepTabs extends React.Component<Props> {
  render() {
    const { projectSteps } = this.props;
    console.log(projectSteps);

    return (
      <div className="step-tabs-bar">
        <ul className="nav" id="step-tabs-list">
          <li className="active">
            <a href="" className="d-flex">
              <div className="navbar__step-nb">
                <span>1</span>
              </div>
              <div className="navbar__step">
                <span className="navbar__step-title">
                  Titre étape très très longue pour voir comment ça fait
                </span>
                <p className="excerpt">ouvert</p>
              </div>
            </a>
            <svg height="80" width="21" xmlns="http://www.w3.org/2000/svg">
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
          <li>
            <a href="" className="d-flex">
              <div className="navbar__step-nb">
                <span>2</span>
              </div>
              <div className="navbar__step">
                <span className="navbar__step-title">Titre étape encore un peu longue</span>
                <p className="excerpt">ouvert</p>
              </div>
            </a>
            <svg height="80" width="21" xmlns="http://www.w3.org/2000/svg">
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
          <li>
            <a href="" className="d-flex">
              <div className="navbar__step-nb">
                <span>3</span>
              </div>
              <div className="navbar__step">
                <span className="navbar__step-title">Titre étape</span>
                <p className="excerpt">ouvert</p>
              </div>
            </a>
            <svg height="80" width="21" xmlns="http://www.w3.org/2000/svg">
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
          <li>
            <a href="" className="d-flex">
              <div className="navbar__step-nb">
                <span>4</span>
              </div>
              <div className="navbar__step">
                <span className="navbar__step-title">Ma petite étape</span>
                <p className="excerpt">ouvert</p>
              </div>
            </a>
            <svg height="80" width="21" xmlns="http://www.w3.org/2000/svg">
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
        </ul>
      </div>
    );
  }
}

export default ProjectStepTabs;
