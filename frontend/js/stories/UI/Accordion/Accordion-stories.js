// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Accordion from '~ds/Accordion';
import AppBox from '~ui/Primitives/AppBox';
import Text from '~ui/Primitives/Text';

storiesOf('Design system|Accordion', module)
  .add('default', () => {
    return (
      <AppBox bg="gray.500" p="40px">
        <Accordion spacing={2}>
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
      </AppBox>
    );
  })
  .add('with default open', () => {
    return (
      <AppBox bg="gray.500" p="40px">
        <Accordion spacing={2} defaultAccordion="volet-2">
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
      </AppBox>
    );
  })
  .add('with multiple default open', () => {
    return (
      <AppBox bg="gray.500" p="40px">
        <Accordion spacing={2} defaultAccordion={['volet-1', 'volet-2']}>
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
      </AppBox>
    );
  })
  .add('with multiple open allow', () => {
    return (
      <AppBox bg="gray.500" p="40px">
        <Accordion spacing={2} allowMultiple>
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
      </AppBox>
    );
  });
