// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import RankingLabelContainer from './RankingLabel.style';
import Image from '~/components/Ui/Medias/Image';
import Label from '~/components/Ui/DragnDrop/Label/Label';
import Icon from '~/components/Ui/Icons/Icon';
import config from '~/config';

type RankingLabelProps = {
  label: string,
  description?: string,
  image?: {
    url: string,
  },
  isSelected?: boolean,
  onPick?: () => void,
};

const RankingLabel = ({ label, image, description, isSelected, onPick }: RankingLabelProps) => (
  <RankingLabelContainer>
    <Label>{label}</Label>
    {description && <p className="description">{description}</p>}
    {image && image.url && <Image src={image.url} width="100%" />}
    {config.isMobile && !isSelected && (
      <button type="button" onClick={onPick} className="btn-pick-item">
        <Icon name="arrow-thick-circle-down" size={18} viewBox="0 0 18 18" />
        <FormattedMessage id="global.form.ranking.select" />
      </button>
    )}
  </RankingLabelContainer>
);

export default RankingLabel;
