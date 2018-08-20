// @flow
import * as React from 'react';
import { Nav } from 'react-bootstrap';
import ConsultationPlanItem from './ConsultationPlanItem';

type Props = {
  section: Object,
  level: number,
};

export class ConsultationPlanItems extends React.Component<Props> {
  render() {
    const { section, level } = this.props;

    return (
      <Nav bsStyle="pills" stacked activeKey={1}>
        <ConsultationPlanItem section={section} level={level} />
        {section.sections &&
          section.sections.map((subSelection, index) => (
            <ConsultationPlanItems key={index} section={subSelection} level={level + 1} />
          ))}
      </Nav>
    );
  }
}

export default ConsultationPlanItems;
