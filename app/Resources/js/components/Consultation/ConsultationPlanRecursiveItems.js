// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ConsultationPlanRecursiveItems_consultation } from './__generated__/ConsultationPlanRecursiveItems_consultation.graphql';
import ConsultationPlanItems from './ConsultationPlanItems';

type Props = {
  consultation: ConsultationPlanRecursiveItems_consultation,
};

export class ConsultationPlanRecursiveItems extends React.Component<Props> {
  render() {
    const { consultation } = this.props;

    return (
      <React.Fragment>
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
    );
  }
}

export default createFragmentContainer(
  ConsultationPlanRecursiveItems,
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
