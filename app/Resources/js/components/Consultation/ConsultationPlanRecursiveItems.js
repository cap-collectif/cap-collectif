// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import type { Dispatch, GlobalState } from '../../types';
import type { ConsultationPlanRecursiveItems_consultation } from './__generated__/ConsultationPlanRecursiveItems_consultation.graphql';
import ConsultationPlanItems from './ConsultationPlanItems';
import { closeConsultationPlan, openConsultationPlan } from '../../redux/modules/project';
import config from '../../config';

type Props = {
  consultation: ConsultationPlanRecursiveItems_consultation,
  stepId: string,
  closePlan: Function,
  openPlan: Function,
  showConsultationPlan: boolean,
  scrollSpy: (test: boolean) => {},
};

export class ConsultationPlanRecursiveItems extends React.Component<Props> {
  componentDidMount() {
    const { closePlan, stepId, consultation } = this.props;

    if (config.isMobile || (consultation.sections && consultation.sections.length < 2)) {
      closePlan(stepId);
    }
  }

  getPlan = () => {
    const {
      consultation,
      closePlan,
      openPlan,
      showConsultationPlan,
      stepId,
      scrollSpy,
    } = this.props;

    if (showConsultationPlan) {
      return (
        <div className="consultation-plan_open">
          <div className="consultation-plan__header">
            <p>
              <i className="cap cap-android-menu mr-5" />
              <FormattedMessage id="plan" />
            </p>
            <a
              onClick={() => {
                closePlan(stepId);
              }}>
              <i className="cap cap-delete-1" />
            </a>
          </div>
          <div className="consultation-plan__list">
            {consultation.sections &&
              consultation.sections
                .filter(Boolean)
                .map((section, index) => (
                  <ConsultationPlanItems
                    key={index}
                    sectionKey={index}
                    section={section}
                    level={0}
                  />
                ))}
          </div>
          <div className="consultation-plan__back-to-top">
            <a onClick={this.handleClick}>
              <i className="cap cap-arrow-68 mr-5" />
              <FormattedMessage id="back-to-top" />
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="consultation-plan_close">
        <a
          onClick={() => {
            openPlan(stepId);
            scrollSpy(true);
          }}>
          <i className="cap cap-android-menu mr-5 hidden-xs hidden-sm" />
          <FormattedMessage id="plan" />
          <i className="cap cap-android-menu ml-5 hidden-md hidden-lg" />
        </a>
      </div>
    );
  };

  handleClick = () => {
    if (config.canUseDOM && document.body) {
      document.body.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
    }
  };

  render() {
    const { consultation } = this.props;

    if (consultation.sections && consultation.sections.length < 2) {
      return null;
    }

    return this.getPlan();
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, props: Props) => ({
  showConsultationPlan:
    props.stepId in state.project.showConsultationPlanById
      ? state.project.showConsultationPlanById[props.stepId]
      : true,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  closePlan: id => {
    dispatch(closeConsultationPlan(id));
  },
  openPlan: id => {
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
