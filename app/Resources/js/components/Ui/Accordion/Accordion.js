// @flow
import React, { useState } from 'react';
import { Panel, PanelGroup } from 'react-bootstrap';

type Input = {|
  key: string,
  title: HTMLElement,
  content: HTMLElement,
|};

type Props = {|
  openedColor: string,
  closedColor: string,
  defaultActiveKey: string,
  inputs: Array<Input>,
|};

export const Accordion = ({ defaultActiveKey, inputs, openedColor, closedColor }: Props) => {
  const [activeKey, changeActiveKey] = useState(defaultActiveKey);

  return (
    <PanelGroup
      accordion
      id="accordion-controlled-example"
      activeKey={activeKey}
      onSelect={(key: string) => changeActiveKey(key)}>
      {inputs.length &&
        inputs.map(input => (
          <Panel>
            <Panel.Heading eventKey={input.key}>
              <Panel.Title toggle variant="link">
                {input.title}
              </Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>{input.content}</Panel.Body>
          </Panel>
        ))}
    </PanelGroup>
  );
};

export default Accordion;
