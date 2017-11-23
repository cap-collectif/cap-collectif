import React, { PureComponent } from 'react';
import { Col, Label } from 'react-bootstrap';
import { injectIntl } from 'react-intl';

type Media = {
  name: string,
  extension: string,
  url: string,
};

type Props = {
  medias: Array<Media>,
};

export class PreviewMedia extends PureComponent<Props> {
  render() {
    const { medias } = this.props;

    if (medias.length === 0) {
      return <p>Aucun document mise en ligne.</p>;
    }

    return (
      <div>
        <p>Liste des fichiers actuellement en ligne :</p>
        <Col md={12} className="image-uploader__label-info" style={{ padding: 0 }}>
          {medias &&
            medias.map((media, key) => {
              return (
                <a key={key} href={media.url} rel="noopener noreferrer" target="_blank">
                  <Label bsStyle="success" style={{ marginRight: '5px' }}>
                    {media.name}.{media.extension}
                  </Label>
                </a>
              );
            })}
        </Col>
      </div>
    );
  }
}

export default injectIntl(PreviewMedia);
