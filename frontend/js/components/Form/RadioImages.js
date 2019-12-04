// @flow
import * as React from 'react';
import { Row, Button } from 'react-bootstrap';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { baseUrl } from '../../config';

type MediaImage = {|
  id: string,
  name: string,
  url: string,
|};

type Media = {|
  id: string,
  image: MediaImage,
|};

type Props = {|
  medias: Array<Media>,
  value: Media,
  onChange: (?Media) => {},
  disabled?: boolean,
|};

type State = {|
  showOnMobile: boolean,
|};

const checkCircle = {
  src: `${baseUrl}/svg/check-circle-1.svg`,
  alt: 'check-circle',
};

const RadioImage: StyledComponent<{}, {}, HTMLImageElement> = styled.img`
  width: 178px;
  height: 56px;
  border-radius: 5px;
  object-fit: cover;
`;

const CheckedIcon: StyledComponent<{}, {}, HTMLImageElement> = styled.img`
  width: 14px;
  height: 14px;
  position: absolute;
  bottom: 7px;
  right: 12px;
`;

const WrapperButton: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
`;

const Content = styled.div`
  @media (max-width: 767px) {
    display: ${props => (props.showOnMobile ? 'unset' : 'none')};
  }
`;

const ShowOnMobileButton = styled(Button)`
  width: 178px;
  @media (min-width: 767px) {
    display: none;
  }
`;

export class RadioImages extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showOnMobile: false,
    };
  }

  handleChange = (selectedValue: Media) => {
    const { value, onChange } = this.props;
    if (selectedValue === value) onChange(null);
    if (selectedValue.id === value.id) onChange(null);
    else onChange(selectedValue);
  };

  renderMedia = (value: Media, media: Media, key: any) => {
    const isDisabled: boolean = value && value.id !== media.id;
    return (
      <div key={key} className="col-sm-4 mb-10" style={{ padding: 0 }}>
        <WrapperButton
          type="button"
          onClick={() => this.handleChange(media)}
          style={{ opacity: isDisabled ? '0.5' : '1' }}>
          <RadioImage
            src={media.image.url}
            alt="proposal-media" // to change ?
            style={{ cursor: isDisabled ? 'default' : 'pointer' }}
          />
          {value && !isDisabled && <CheckedIcon src={checkCircle.src} alt={checkCircle.alt} />}
        </WrapperButton>
      </div>
    );
  };

  render() {
    const { medias, value, disabled } = this.props;
    const { showOnMobile } = this.state;
    if (disabled) {
      return null;
    }

    return (
      <>
        {medias && medias.length > 0 && (
          <>
            <ShowOnMobileButton
              bsStyle="primary"
              className="btn-outline-primary mb-10"
              onClick={() => {
                this.setState((prevState: State) => ({
                  showOnMobile: !prevState.showOnMobile,
                }));
              }}>
              <FormattedMessage id={showOnMobile ? 'mask_image_list' : 'display_image_list'} />
              <i className={showOnMobile ? 'cap-arrow-68 ml-10' : 'cap-arrow-67 ml-10'} />
            </ShowOnMobileButton>
            <Row className="p-10">
              <Content className="document-container" showOnMobile={showOnMobile}>
                {medias.map((media, key) => {
                  return this.renderMedia(value, media, key);
                })}
              </Content>
            </Row>
          </>
        )}
      </>
    );
  }
}

export default RadioImages;
