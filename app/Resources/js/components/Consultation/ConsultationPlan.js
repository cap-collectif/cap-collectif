// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { Button } from 'react-bootstrap';
import type { Dispatch, GlobalState } from '../../types';
import type { ConsultationPlan_consultation } from '~relay/ConsultationPlan_consultation.graphql';
import ConsultationPlanItems from './ConsultationPlanItems';
import { closeConsultationPlan, openConsultationPlan } from '../../redux/modules/project';
import config from '../../config';
import StackedNav from '../Ui/Nav/StackedNav';

type RelayProps = {|
  +consultation: ConsultationPlan_consultation,
|};

type StateProps = {|
  +showConsultationPlan: boolean,
|};

type DispatchProps = {|
  +closePlan: typeof closeConsultationPlan,
  +openPlan: typeof openConsultationPlan,
|};

type Props = {|
  ...StateProps,
  ...DispatchProps,
  ...RelayProps,
  +intl: IntlShape,
|};

export class ConsultationPlan extends React.Component<Props> {
  componentDidMount() {
    const { closePlan, consultation } = this.props;

    if (config.isMobile || (consultation.sections && consultation.sections.length < 2)) {
      closePlan(consultation.id);
    }
  }

  backToTop = () => {
    if (config.canUseDOM && document.body) {
      document.body.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
    }
  };

  openAction = () => {
    const { openPlan, consultation } = this.props;

    openPlan(consultation.id);
  };

  render() {
    const { consultation, closePlan, showConsultationPlan, intl } = this.props;

    if (consultation.sections && consultation.sections.length < 2) {
      return null;
    }

    if (showConsultationPlan) {
      return (
        <StackedNav>
          <div className="stacked-nav__header">
            <p>
              <i className="cap cap-android-menu mr-5" />
              <FormattedMessage id="plan" />
            </p>
            <Button
              id="ConsultationPlan-close"
              bsStyle="link"
              className="p-0 btn-md"
              aria-label={intl.formatMessage({ id: 'close-the-plan' })}
              onClick={() => {
                closePlan(consultation.id);
              }}>
              <i className="cap cap-delete-1" />
            </Button>
          </div>
          <div className="stacked-nav__list">
            {consultation.sections &&
              consultation.sections
                .filter(Boolean)
                .map((section, index) => (
                  <ConsultationPlanItems key={index} section={section} level={0} />
                ))}
          </div>
          <div className="stacked-nav__footer">
            <Button
              id="ConsultationPlan-backToTop"
              bsStyle="link"
              className="p-0"
              onClick={this.backToTop}>
              <i className="cap cap-arrow-68 mr-5" />
              <FormattedMessage id="back-to-top" />
            </Button>
          </div>
        </StackedNav>
      );
    }

    return (
      <div className="consultation-plan_close">
        <Button
          id="ConsultationPlan-open"
          bsStyle="link"
          className="p-0 btn-md"
          aria-label={intl.formatMessage({ id: 'open-the-plan' })}
          onClick={this.openAction}>
          <i className="cap cap-android-menu mr-5 hidden-xs hidden-sm" />
          <FormattedMessage id="plan" />
          <i className="cap cap-android-menu ml-5 hidden-md hidden-lg" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: RelayProps) => ({
  showConsultationPlan:
    state.project && state.project.showConsultationPlanById
      ? props.consultation.id in state.project.showConsultationPlanById
        ? state.project.showConsultationPlanById[props.consultation.id]
        : true
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
)(injectIntl(ConsultationPlan));

export default createFragmentContainer(container, {
  consultation: graphql`
    fragment ConsultationPlan_consultation on Consultation {
      id
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
});
