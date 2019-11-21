// @flow
import * as React from 'react';
import { Collapse, Nav } from 'react-bootstrap';
import ConsultationPlanItem from './ConsultationPlanItem';

type Props = {|
  +section: Object,
  +level: number,
|};

type State = {|
  +isOpen: boolean,
|};

export class ConsultationPlanItems extends React.Component<Props, State> {
  state = {
    isOpen: false,
  };

  handleCollapse = (activeItem: boolean) => {
    this.setState({ isOpen: activeItem });
  };

  render() {
    const { section, level } = this.props;
    const { isOpen } = this.state;

    return (
      <Nav>
        {/* Using `li` instead of here NavItem throws a warning, we well see with react-bootstrap 4 */}
        <li>
          <ConsultationPlanItem
            section={section}
            level={level}
            onCollapse={activeItem => {
              this.handleCollapse(activeItem);
            }}
          />
          <Collapse in={isOpen}>
            <div>
              {section.sections &&
                section.sections.map((subSelection, index) => (
                  <ConsultationPlanItems key={index} section={subSelection} level={level + 1} />
                ))}
            </div>
          </Collapse>
        </li>
      </Nav>
    );
  }
}

export default ConsultationPlanItems;
