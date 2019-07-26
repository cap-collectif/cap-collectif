// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Video } from '../../../components/Ui/Medias/Video';

const video = {
  title: 'Baby come back',
  body: "Ça c'est dla zik",
  link: 'https://www.youtube.com/embed/Hn-enjcgV1o?autoplay=1',
  media: {
    id: 'media1',
    binaryContent: 'project-1.jpg',
    name: 'Titre du média 1',
    category: '@MediaCategory1',
    providerReference: 'providerReference1.jpg',
    thumbnailLink: 'https://ichef.bbci.co.uk/images/ic/960x540/p01bqs57.jpg',
  },
};

storiesOf('Core|Medias', module).add(
  'Video',
  () => {
    return (
      <div className="container">
        <div className="row">
          <div className="col-xs-12  col-sm-6  col-md-4  col-lg-8">
            <Video video={video} />
          </div>
        </div>
      </div>
    );
  },
  {
    info: {
      text: `
            Ce composant est utilisé
        `,
    },
  },
);
