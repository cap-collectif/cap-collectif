// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { useResize } from '@liinkiing/react-hooks';
import styled, { type StyledComponent } from 'styled-components';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';
import CategoryBackground from '~/components/Ui/Medias/CategoryBackground';
import { type CategoryImage } from '../ProposalFormAdminCategoriesStepModal';
import { mediaQueryMobile, bootstrapGrid } from '~/utils/sizes';
import Image from '~ui/Primitives/Image';

type Props = {|
  +color: ?string,
  +icon: ?string,
  +name: ?string,
  +customCategoryImage: ?CategoryImage,
|};

const Container: StyledComponent<{ hasTitle: boolean }, {}, HTMLDivElement> = styled.div`
  position: relative;
  width: 49%;
  height: 49%;
  ${MAIN_BORDER_RADIUS};
  border: 1px solid #e3e3e3;

  > svg {
    position: absolute;
    top: calc(calc(50% - 20px) - 20px);
    left: calc(50% - 20px);
  }

  > img {
    width: 100%;
    object-fit: cover;
    height: calc(100% - 38px);
    margin-bottom: 3px;
    max-height: 80px;
  }

  > svg#background {
    /** So that the svg envelops the border */
    margin: -1px;
    position: initial;
  }

  > div {
    display: flex;
    padding: 4px 12px 7px;
    align-items: center;
  }

  span {
    margin-left: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${({ hasTitle }) => !hasTitle && '#a2abb4'};
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    overflow: hidden;

    #background {
      max-height: 80px;
      min-height: 80px;
    }
  }
`;

const CircledIcon: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 24px;
  min-width: 24px;
  height: 24px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.175);
  border-radius: 12px;
  padding-left: 7px;
  padding-top: 1px;
`;

export const ProposalFormCategoryBackgroundPreview = ({
  color,
  name,
  icon,
  customCategoryImage,
}: Props) => {
  const { width } = useResize();

  return (
    <Container hasTitle={!!name}>
      {customCategoryImage ? (
        <Image
          src={customCategoryImage?.url || customCategoryImage.image?.url}
          alt="Category background"
        />
      ) : (
        <>
          {icon && <Icon name={ICON_NAME[icon]} size={40} color={colors.white} />}
          <CategoryBackground
            color={color}
            viewBox={width < bootstrapGrid.smMin ? '0 0 200 45' : null}
          />
        </>
      )}
      <div>
        <CircledIcon>
          <Icon name={ICON_NAME.tag} size={12} color={colors.primaryColor} />
        </CircledIcon>
        <span>{name || <FormattedMessage id="category.without.title" />}</span>
      </div>
    </Container>
  );
};

export default ProposalFormCategoryBackgroundPreview;
