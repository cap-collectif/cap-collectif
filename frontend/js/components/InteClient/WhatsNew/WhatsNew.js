// @flow
import * as React from 'react';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import Heading from '~ui/Primitives/Heading';
import Link from '~ds/Link/Link';
import { LineHeight } from '~ui/Primitives/constants';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import colors from '~/styles/modules/colors';

const purple = '#331B44';

type NewsBlock = {|
  +title: string,
  +body: string,
  +url: string,
  +cover: string,
  +hasSeparator: boolean,
  +isButtonPlain: boolean,
|};

export type Props = {|
  ...AppBoxProps,
  newsArray: Array<NewsBlock>,
|};

export const WhatsNew = ({ newsArray }: Props) => (
  <Flex direction="column" spacing={10}>
    {newsArray.map(
      ({ title, body, url, cover, hasSeparator, isButtonPlain }: NewsBlock, idx: number) => (
        <Flex key={idx} direction={['column', idx % 2 ? 'row-reverse' : 'row']} alignItems="center">
          <AppBox width="100%" m={5} flex="1 1 0">
            <AppBox
              overflow="hidden"
              css={{
                background: `url(${cover})`,
                backgroundSize: 'cover',
              }}
              position="relative"
              width="100%"
              pt="66.66%"
              borderRadius={8}
            />
          </AppBox>
          <Flex direction="column" m={5} flex="1 1 0">
            <Heading
              css={{
                color: purple,
                '& > strong': { color: colors.aqua[500] },
                fontSize: '33px',
                fontWeight: '900',
              }}
              as="h4"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            {hasSeparator && (
              <AppBox className="separator-news" width="64px" height="6px" bg="aqua.500" mb={4} />
            )}
            <Text
              truncate={144}
              fontSize="18px"
              color="neutral-gray.900"
              lineHeight={LineHeight.Base}
              mb={6}>
              {body}
            </Text>
            <Link
              style={{
                color: isButtonPlain ? purple : 'white',
                background: isButtonPlain ? 'white' : purple,
                borderColor: purple,
                textDecoration: 'none',
              }}
              width="fit-content"
              href={url}
              border="1px solid"
              borderRadius="4px"
              className={isButtonPlain ? 'btn-news plain' : 'btn-news'}
              p="12px 32px">
              Participer
            </Link>
          </Flex>
        </Flex>
      ),
    )}
  </Flex>
);

export default WhatsNew;
