// @flow
import * as React from 'react';
import styled from 'styled-components';
import { ProgressBar } from "react-bootstrap";
import { CardContainer } from "../components/Ui/Card/CardContainer";
import CardType from "../components/Ui/Card/CardType";
import CardCover from "../components/Ui/Card/CardCover";
import {Progress} from "../components/Ui/Progress";
import {CardUser} from "../components/Ui/Card/CardUser";

type Props = {
  project: Object,
};

const Tag = styled.div`
  padding: 5px 0 0 5px; 
  font-size: 14px;
  
  .cap {
    padding-right: 5px;
  }
`;

const Counters = styled.div`
  padding: 5px;
  background-color: #f6f6f6;
  border-top: 1px solid #e3e3e3;
`;

const Counter = styled.div`
  
`; // existe encore plusieurs counters ?

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

export class Card extends React.Component<Props> {
  static defaultProps = {};

  render() {
    const { project } = this.props;

    return (
      <CardContainer>
        <CardType color={project.type.color}>
          {project.type.title}
        </CardType>
        <CardCover>
          <img src={project.cover} alt={project.title}/>
        </CardCover>
        <CardUser>
          <div className="card__user__avatar">
            <img src="https://source.unsplash.com/random" alt=""/>
          </div>
          <div>
            <a href="">welcomattic</a>
            <p>
              <div className="excerpt">
                1 janvier 2015
              </div>
            </p>
          </div>
          <hr/>
        </CardUser>
        <div className="card__body">
          <div className="card__body__infos">
            <div className="excerpt">
              {project.theme}
            </div>
            <h3 className="card__title">
              <a href="#">
                {project.title}
              </a>
            </h3>
            <div className="excerpt">
              Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.
            </div>
            <div>
              <div className="excerpt">
                <span className="excerpt_dark">0</span> contribution
              </div>
            </div>
            <div>
              <div className="excerpt">
                <span className="excerpt_dark">0</span> participant
              </div>
            </div>
            <Tag>
              <i className="cap glyphicon glyphicon-pushpin" /> {/* replace by true icons */}
              Justice
            </Tag>
            <Tag>
              <i className="cap glyphicon glyphicon-fire" />
              Maurepas Patton
            </Tag>
          </div>
          <Progress>
            <ProgressBar
              bsStyle={project.step.bsStyle}
              now={project.step.now}
              label={project.step.label}
              className={project.step.className}
            />
          </Progress>
          <div className="card__actions">
            <div className="excerpt">
              <a href="">
                Participer
              </a>
              <span className="excerpt_dark">
                10
              </span>{' '}
              <span>
                jours restants {/* <remainingTime /> */}
              </span>
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

export default Card;
