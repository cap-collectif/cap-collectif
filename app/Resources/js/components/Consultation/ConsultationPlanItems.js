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
      <Nav bsStyle="pills" stacked className="panel">
        <ConsultationPlanItem section={section} level={level} />
        <div id={`collapseCslt${section.__id}`} className={level === 0 ? 'collapse' : 'collapse in'}> {/* className={level === 0 ? 'collapse' : ''} => petit bug au premier clique OU className="collapse" */}
          {section.sections &&
          section.sections.map((subSelection, index) => (
            <ConsultationPlanItems key={index} section={subSelection} level={level + 1} />
          ))}
        </div>

      </Nav>
    );
  }
}

export default ConsultationPlanItems;
