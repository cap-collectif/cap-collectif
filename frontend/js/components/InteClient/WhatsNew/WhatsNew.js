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
import useIsMobile from '~/utils/hooks/useIsMobile';

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

export const WhatsNew = ({ newsArray }: Props) => {
  const isMobile = useIsMobile();
  return (
    <Flex direction="column" spacing={10}>
      {newsArray.map(
        ({ title, body, url, cover, hasSeparator, isButtonPlain }: NewsBlock, idx: number) => (
          <Flex
            key={idx}
            direction={['column', idx % 2 ? 'row' : 'row-reverse']}
            alignItems="center"
            boxShadow={isMobile ? '0px 10px 50px rgba(0, 0, 0, 0.15)' : ''}
            borderRadius={[8, 0]}>
            <AppBox width="100%" m={[0, 5]} flex="1 1 0">
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
                borderBottomLeftRadius={[0, 8]}
                borderBottomRightRadius={[0, 8]}
              />
            </AppBox>
            <Flex direction="column" flex="1 1 0" m={[0, 5]}>
              <Heading
                css={{
                  color: purple,
                  '& > strong': { color: colors.aqua[500] },
                  fontSize: '33px',
                  fontWeight: '900',
                  margin: isMobile && '20px 20px 16px',
                }}
                as="h4"
                dangerouslySetInnerHTML={{ __html: title }}
              />
              {hasSeparator && (
                <AppBox
                  className="separator-news"
                  width="64px"
                  height="6px"
                  bg="aqua.500"
                  mb={[0, 4]}
                  ml={[4, 0]}
                />
              )}
              <Text
                mb={[5, 5]}
                m={[5, 0]}
                truncate={144}
                fontSize="18px"
                color="neutral-gray.900"
                lineHeight={LineHeight.Base}>
                {body}
              </Text>
              <Link
                style={{
                  color: isButtonPlain ? purple : 'white',
                  background: isButtonPlain ? 'white' : purple,
                  borderColor: purple,
                  textDecoration: 'none',
                }}
                textAlign="center"
                width={['100%', 'fit-content']}
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
};

export default WhatsNew;
