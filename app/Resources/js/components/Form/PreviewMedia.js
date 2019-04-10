// @flow
import * as React from 'react';
import { Col, Label, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

type Media = {
  id: string,
  name: string,
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
        {medias && medias.length > 0 && (
          <Col md={12} className="image-uploader__label-info" style={{ padding: 0 }}>
            <strong>
              <FormattedMessage id="proposal.documents.deposited" />
            </strong>{' '}
            {medias.map((file, key) => (
              <Label key={key} bsStyle="info" style={{ marginRight: '5px' }}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>{' '}
                <Button
                  bsStyle="link"
                  onClick={() => {
                    onRemoveMedia(file);
                  }}>
                  <i style={{ cursor: 'pointer' }} className="glyphicon glyphicon-remove" />
                </Button>
              </Label>
            ))}
          </Col>
        )}
      </div>
    );
  }
}

export default PreviewMedia;
