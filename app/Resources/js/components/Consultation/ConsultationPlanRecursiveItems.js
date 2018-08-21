// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import type { Dispatch, GlobalState } from '../../types';
import type { ConsultationPlanRecursiveItems_consultation } from './__generated__/ConsultationPlanRecursiveItems_consultation.graphql';
import ConsultationPlanItems from './ConsultationPlanItems';
import { closeConsultationPlan, openConsultationPlan } from "../../redux/modules/project";

type Props = {
  consultation: ConsultationPlanRecursiveItems_consultation,
  stepId: string,
  closePlan: Function,
  openPlan: Function,
  showConsultationPlan: boolean,
};

export class ConsultationPlanRecursiveItems extends React.Component<Props> {
  getPlan = () => {
    const { consultation, closePlan, openPlan, showConsultationPlan, stepId } = this.props;

    if(showConsultationPlan) {
      return (
        <React.Fragment>
          <div className="consultation-plan_open">
            <p><i className="cap cap-android-menu mr-5" />PLAN</p>
            <a onClick={() => {
              closePlan(stepId);
            }}>
              <i className="cap cap-delete-1" />
            </a>
          </div>
          {consultation.sections &&
          consultation.sections
            .filter(Boolean)
            .map((section, index) => (
              <ConsultationPlanItems
                key={index}
                consultation={consultation}
                section={section}
                level={0}
              />
            ))}
        </React.Fragment>
      )
    }

    return (
      <div className="consultation-plan_close">
        <span>Plan</span><br/>
        <a onClick={() => {
          openPlan(stepId);
        }}><i className="cap cap-android-menu"/></a>
      </div>
    )
  };

  render() {

    return this.getPlan();
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  showConsultationPlan: state.project.showConsultationPlan,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  closePlan: (id) => {
    dispatch(closeConsultationPlan(id));
  },
  openPlan: (id) => {
    dispatch(openConsultationPlan(id));
  },
});

const container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConsultationPlanRecursiveItems);


export default createFragmentContainer(
  container,
  graphql`
    fragment ConsultationPlanRecursiveItems_consultation on Consultation {
      sections {
        ...ConsultationPlanItem_section
        sections {
          ...ConsultationPlanItem_section
          sections {
            ...ConsultationPlanItem_section
            sections {
              ...ConsultationPlanItem_section
              sections {
                ...ConsultationPlanItem_section
              }
            }
          }
        }
      }
    }
  `,
);
