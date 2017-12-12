// @flow
import * as React from 'react';
import { Col, Label } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

type Media = {
  id: string,
  name: string,
  extension: string,
  url: string,
};

type Props = {
  medias: Array<Media>,
  onRemoveMedia: (newMedia: Media) => void,
};

type State = {
  initialMedias: Array<Media>,
};

export class PreviewMedia extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      initialMedias: props.medias,
    };
  }

  render() {
    const { medias, onRemoveMedia } = this.props;

    if (medias.length === 0) {
      return null;
    }

    return (
      <div>
        {/* {initialMedias &&
          initialMedias.length > 0 && (
            <span className="help-block">
              <FormattedMessage id="proposal.documents.helptext" />
            </span>
          )} */}
        {medias &&
          medias.length > 0 && (
            <Col md={12} className="image-uploader__label-info" style={{ padding: 0 }}>
              <strong>
                <FormattedMessage id="proposal.documents.deposited" />
              </strong>{' '}
              {medias.map((file, key) => {
                return (
                  <Label key={key} bsStyle="info" style={{ marginRight: '5px' }}>
                    {file.name}{' '}
                    <i
                      style={{ cursor: 'pointer' }}
                      className="glyphicon glyphicon-remove"
                      onClick={() => {
                        onRemoveMedia(file);
                      }}
                    />
                  </Label>
                );
              })}
            </Col>
          )}
        {/* {initialMedias &&
          initialMedias.length > 0 && (
            <Col md={12} className="image-uploader__label-info" style={{ padding: 0 }}>
              <strong>
                <FormattedMessage id="proposal.documents.added" />
              </strong>{' '}
              {initialMedias.map((media, key) => {
                return (
                  <a key={key} href={media.url} rel="noopener noreferrer" target="_blank">
                    <Label bsStyle="success" style={{ marginRight: '5px' }}>
                      {media.name}.{media.extension}
                    </Label>
                  </a>
                );
              })}
            </Col>
          )} */}
      </div>
    );
  }
}

export default PreviewMedia;
