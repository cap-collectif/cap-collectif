// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { RectShape, RoundShape } from 'react-placeholder/lib/placeholders';
import Card from '~ds/Card/Card';
import Flex from '~ui/Primitives/Layout/Flex';
import AppBox from '~ui/Primitives/AppBox';
import Tag from '~ds/Tag/Tag';

const FaceToFacePlaceholder = () => (
  <Flex direction="column" spacing={7}>
    <AppBox
      as={RectShape}
      bg="gray.150"
      borderRadius="placeholder"
      style={{ width: '50%', height: '20px', marginRight: 0 }}
    />

    <Flex direction="row" justify="space-between" spacing={6}>
      <Card as={Flex} flexDirection="column" flex={1} position="relative" pt={10}>
        <Tag
          variant="green"
          position="absolute"
          top="-1px"
          left="-1px"
          borderBottomLeftRadius={0}
          borderTopRightRadius={0}
          interactive={false}>
          <FormattedMessage id="opinion.for" />
        </Tag>

        <Flex direction="row" spacing={4} mb={5} align="center">
          <AppBox
            as={RoundShape}
            bg="gray.150"
            style={{ width: '32px', height: '32px', marginRight: 0 }}
          />
          <AppBox
            as={RectShape}
            bg="gray.150"
            borderRadius="placeholder"
            style={{ width: '40%', height: '20px', marginRight: 0 }}
          />
        </Flex>

        <AppBox
          as={RectShape}
          bg="gray.150"
          borderRadius="placeholder"
          style={{ width: '100%', height: '110px', marginRight: 0 }}
        />
      </Card>

      <Card as={Flex} flexDirection="column" flex={1} position="relative" pt={10}>
        <Tag
          variant="red"
          position="absolute"
          top="-1px"
          left="-1px"
          borderBottomLeftRadius={0}
          borderTopRightRadius={0}
          interactive={false}>
          <FormattedMessage id="opinion.against" />
        </Tag>

        <Flex direction="row" spacing={4} mb={5} align="center">
          <AppBox
            as={RoundShape}
            bg="gray.150"
            style={{ width: '32px', height: '32px', marginRight: 0 }}
          />
          <AppBox
            as={RectShape}
            bg="gray.150"
            borderRadius="placeholder"
            style={{ width: '40%', height: '20px', marginRight: 0 }}
          />
        </Flex>

        <AppBox
          as={RectShape}
          bg="gray.150"
          borderRadius="placeholder"
          style={{ width: '100%', height: '110px', marginRight: 0 }}
        />
      </Card>
    </Flex>
  </Flex>
);

export default FaceToFacePlaceholder;
