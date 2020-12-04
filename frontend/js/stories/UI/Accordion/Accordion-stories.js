// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Accordion from '~ds/Accordion';
import Text from '~ui/Primitives/Text';

storiesOf('Design system|Accordion', module)
  .add('default', () => {
    return (
      <Accordion>
        <Accordion.Item id="volet-1">
          <Accordion.Button>
            <Text color="blue.900" fontSize={4}>
              Volet 1
            </Text>
          </Accordion.Button>
          <Accordion.Panel>
            <Text color="gray.500" fontSize={3}>
              Contenu du volet 1
            </Text>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item id="volet-2">
          <Accordion.Button>
            <Text color="blue.900" fontSize={4}>
              Volet 2
            </Text>
          </Accordion.Button>
          <Accordion.Panel>
            <Text color="gray.500" fontSize={3}>
              Contenu du volet 2
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  })
  .add('with default open', () => {
    return (
      <Accordion defaultAccordion="volet-2">
        <Accordion.Item id="volet-1">
          <Accordion.Button>
            <Text color="blue.900" fontSize={4}>
              Volet 1
            </Text>
          </Accordion.Button>
          <Accordion.Panel>
            <Text color="gray.500" fontSize={3}>
              Contenu du volet 1
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item id="volet-2">
          <Accordion.Button>
            <Text color="blue.900" fontSize={4}>
              Volet 2
            </Text>
          </Accordion.Button>
          <Accordion.Panel>
            <Text color="gray.500" fontSize={3}>
              Contenu du volet 2
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  })
  .add('with multiple default open', () => {
    return (
      <Accordion defaultAccordion={['volet-1', 'volet-2']}>
        <Accordion.Item id="volet-1">
          <Accordion.Button>
            <Text color="blue.900" fontSize={4}>
              Volet 1
            </Text>
          </Accordion.Button>
          <Accordion.Panel>
            <Text color="gray.500" fontSize={3}>
              Contenu du volet 1
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item id="volet-2">
          <Accordion.Button>
            <Text color="blue.900" fontSize={4}>
              Volet 2
            </Text>
          </Accordion.Button>
          <Accordion.Panel>
            <Text color="gray.500" fontSize={3}>
              Contenu du volet 2
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  })
  .add('with multiple open allow', () => {
    return (
      <Accordion allowMultiple>
        <Accordion.Item id="volet-1">
          <Accordion.Button>
            <Text color="blue.900" fontSize={4}>
              Volet 1
            </Text>
          </Accordion.Button>
          <Accordion.Panel>
            <Text color="gray.500" fontSize={3}>
              Contenu du volet 1
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item id="volet-2">
          <Accordion.Button>
            <Text color="blue.900" fontSize={4}>
              Volet 2
            </Text>
          </Accordion.Button>
          <Accordion.Panel>
            <Text color="gray.500" fontSize={3}>
              Contenu du volet 2
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  });
