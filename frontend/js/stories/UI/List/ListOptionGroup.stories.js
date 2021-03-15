// @flow
import * as React from 'react';
import { useState } from 'react';
import ListOptionGroup from '~ds/List/ListOptionGroup';
import Flex from '~ui/Primitives/Layout/Flex';
import Modal from '~ds/Modal/Modal';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';
import Heading from '~ui/Primitives/Heading';

export default {
  title: 'Design system/List/ListOptionGroup',
  component: ListOptionGroup,
  argTypes: {
    value: { description: 'selected value' },
    onChange: { action: 'Change' },
  },
};
const Template = () => {
  const [sort, setSort] = useState('newest');
  return (
    <Flex direction="column" spacing={2}>
      <Modal
        ariaLabel="Tri"
        disclosure={
          <Button variant="tertiary" variantColor="primary" rightIcon={ICON_NAME.ARROW_DOWN}>
            Tri
          </Button>
        }>
        <Modal.Header>
          <Heading>Trier par</Heading>
        </Modal.Header>
        <Modal.Body>
          <ListOptionGroup value={sort} onChange={setSort} type="radio">
            <ListOptionGroup.Item value="newest">Les plus récents</ListOptionGroup.Item>
            <ListOptionGroup.Item value="oldest">Les plus anciens</ListOptionGroup.Item>
            <ListOptionGroup.Item value="popular">Les plus soutenus</ListOptionGroup.Item>
          </ListOptionGroup>
        </Modal.Body>
      </Modal>
    </Flex>
  );
};

export const main = Template.bind({});
main.storyName = 'Default';
main.args = { value: 'newest' };
