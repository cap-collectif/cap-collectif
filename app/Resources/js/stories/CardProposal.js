// @flow
import * as React from 'react';
import styled from 'styled-components';
import {CardContainer} from "../components/Ui/Card/CardContainer";
import {CardUser} from "../components/Ui/Card/CardUser";


type Props = {
  project: Object,
};

const Counters = styled.div`
  padding: 5px;
  background-color: #f6f6f6;
  border-top: 1px solid #e3e3e3;
`;

const Counter = styled.div`
  
`;

const Value = styled.div`
  font-size: 18px;
`;

const Label = styled.div`
  
`;

const Status = styled.div`
  background-color: #707070;
  color: #fff;
  padding: 3px;
  border-radius: 0 0 4px 4px;
`;

export class CardProposal extends React.Component<Props> {
  static defaultProps = {};

  render() {
    const { project } = this.props;

    return (
      <CardContainer>
        <CardUser>
          <div className="card__user__avatar">
            <img src={project.user.avatar} alt={project.user.name}/>
          </div>
          <div>
            <a href="">{project.user.name}</a>
            <p>
              <div className="excerpt small">
                1 janvier 2015
              </div>
            </p>
          </div>
          <hr/>
        </CardUser>
        <div className="card__body">
          <div className="card__body__infos">
            <h3 className="card__title">
              <a href="#">
                {project.title}
              </a>
            </h3>
            <div className="excerpt small">
              Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.
            </div>
            <div className="card__tags">
              <div className="card__tag ellipsis">
                <i className="cap cap-tag-1-1 icon--blue" />
                Justice
              </div>
              <div className="card__tag ellipsis">
                <i className="cap cap-marker-1-1 icon--blue" />
                Maurepas Patton
              </div>
            </div>

          </div>
        </div>
        <div className="small text-center">
          <Counters>
            <Counter>
              <Value>
                15
              </Value>
              <Label>
                commentaires
              </Label>
            </Counter>
          </Counters>
          <Status>
            Aucun statut
          </Status>
        </div>
      </CardContainer>
    );
  }
}

export default CardProposal;
