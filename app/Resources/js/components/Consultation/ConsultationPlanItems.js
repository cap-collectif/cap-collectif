// @flow
import * as React from 'react';
import { Nav } from 'react-bootstrap';
import ConsultationPlanItem from './ConsultationPlanItem';

type Props = {
  section: Object,
  level: number,
  group: number
};

export class ConsultationPlanItems extends React.Component<Props> {
  render() {
    const { section, level, group } = this.props;

    return (
      <Nav bsStyle="pills" stacked className="panel">
        <ConsultationPlanItem section={section} level={level} group={group}/>
        <div
          id={`collapseCslt${section.__id}`}
          className="collapse"> {/* {level === 0 ? 'collapse' : 'collapse in'} */}
          {section.sections &&
            section.sections.map((subSelection, index) => (
              <ConsultationPlanItems key={index} section={subSelection} level={level + 1} group={(group*10)+(index+1)} />
            ))}
        </div>
      </Nav>
    );
  }
}

export default ConsultationPlanItems;

