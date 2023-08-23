// @flow
import * as React from 'react';
import type {StyledComponent} from "styled-components";
import styled from "styled-components";
import {Box, Tag, Text} from "@cap-collectif/ui";
import {useIntl} from "react-intl";
import Image from "~ui/Primitives/Image";
import {bootstrapGrid} from "~/utils/sizes";
import {LineHeight} from "~ui/Primitives/constants";

const ProposalImage: StyledComponent<{}, {}, typeof Image> = styled(Image)`
  border-radius: 4px 4px 0 0;
  height: 83px;
  max-width: 261px;
  object-position: center;
  object-fit: cover;
  width: 100%;

  @media (max-width: ${bootstrapGrid.mdMax}px) {
    max-width: 293px;
  }

  @media (max-width: ${bootstrapGrid.smMax}px) {
    max-width: 345px;
    height: 99px;
  }

  @media (max-width: 838px) {
    max-width: 900px;
  }

  @media (max-width: ${bootstrapGrid.xsMax}px) {
    height: 27.5vw;
  }
`;

type Props = {
  src: ?string,
  sizes: ?string,
  isArchived?: boolean
}


const ProposalImageContainer = ({src, sizes, isArchived = false}: Props) => {
  const intl = useIntl();

  return (
    <Box position="relative">
      {
        isArchived && (
          <Box position="absolute" top={2} right={2}>
            <Tag variantColor="neutral-gray" mr={1}>
              <Text as="span" fontSize={1} lineHeight={LineHeight.SM} fontWeight="700">
                {intl.formatMessage({ id: 'global-archived' })}
              </Text>
            </Tag>
          </Box>
        )
      }
      <ProposalImage src={src} sizes={sizes}  />
    </Box>
  )
}

export default ProposalImageContainer