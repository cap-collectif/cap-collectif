import React, { PureComponent } from 'react';
import { Col, Label } from 'react-bootstrap';
import { injectIntl, FormattedMessage } from 'react-intl';

type CurrentMedia = {
  name: string,
  extension: string,
  url: string,
};

type NewMedia = File;

type Props = {
  currentMedias: Array<CurrentMedia>,
  newMedias: Array<NewMedia>,
  onRemoveMedia: (newMedia: NewMedia) => void,
};

export class PreviewMedia extends PureComponent<Props> {
  render() {
    const { currentMedias, newMedias, onRemoveMedia } = this.props;

    if (currentMedias.length === 0 && newMedias.length === 0) {
      return null;
    }

    return (
      <div>
        {currentMedias &&
          currentMedias.length > 0 && (
            <span className="help-block">
              <FormattedMessage id="proposal.documents.helptext" />
            </span>
          )}
        {newMedias &&
          newMedias.length > 0 && (
            <Col md={12} className="image-uploader__label-info" style={{ padding: 0 }}>
              <strong>
                <FormattedMessage id="proposal.documents.deposited" />
              </strong>{' '}
              {newMedias.map((file, key) => {
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
        {currentMedias &&
          currentMedias.length > 0 && (
            <Col md={12} className="image-uploader__label-info" style={{ padding: 0 }}>
              <strong>
                <FormattedMessage id="proposal.documents.added" />
              </strong>{' '}
              {currentMedias.map((media, key) => {
                return (
                  <a key={key} href={media.url} rel="noopener noreferrer" target="_blank">
                    <Label bsStyle="success" style={{ marginRight: '5px' }}>
                      {media.name}.{media.extension}
                    </Label>
                  </a>
                );
              })}
            </Col>
          )}
      </div>
    );
  }
}

export default injectIntl(PreviewMedia);
