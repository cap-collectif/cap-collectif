// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import DebateArticleCard from '~ui/DebateArticle/DebateArticleCard';
import Grid from '~ui/Primitives/Layout/Grid';

storiesOf('Cap Collectif/ DebateArticleCard', module)
  .add('default', () => {
    return (
      <DebateArticleCard
        maxWidth={365}
        publishedAt="19 oct 2020"
        illustration="https://picsum.photos/536/354">
        <DebateArticleCard.Title>
          Que pèse vraiment le marché du cannabis en France ?
        </DebateArticleCard.Title>
        <DebateArticleCard.Origin>BFM TV</DebateArticleCard.Origin>
      </DebateArticleCard>
    );
  })
  .add('with only a long title', () => {
    return (
      <DebateArticleCard maxWidth={365} illustration="https://picsum.photos/536/354">
        <DebateArticleCard.Title>
          {`Que pèse vraiment le marché du cannabis en France ? Non vraiment répondez moi j'en sais
          rien, à part que SnK c'est incroyable et que Mikasa es tu casa. Avouez j'ai dead ça chakal
          en catchana baby tu dead ça.`}
        </DebateArticleCard.Title>
      </DebateArticleCard>
    );
  })
  .add('with everything', () => {
    return (
      <DebateArticleCard
        maxWidth={365}
        publishedAt="19 oct 2020"
        illustration="https://picsum.photos/536/354">
        <DebateArticleCard.Title>
          Que pèse vraiment le marché du cannabis en France ?
        </DebateArticleCard.Title>
        <DebateArticleCard.Description>
          Le lorem ipsum est, en imprimerie, une suite de mots sans signification utilisée à titre
          provisoire blab bla bla dla pookie tu connais la chanson
        </DebateArticleCard.Description>
        <DebateArticleCard.Origin>BFM TV</DebateArticleCard.Origin>
      </DebateArticleCard>
    );
  })
  .add('with everything excluding illustration', () => {
    return (
      <DebateArticleCard maxWidth={365} publishedAt="19 oct 2020">
        <DebateArticleCard.Title>
          Que pèse vraiment le marché du cannabis en France ?
        </DebateArticleCard.Title>
        <DebateArticleCard.Description>
          Le lorem ipsum est, en imprimerie, une suite de mots sans signification utilisée à titre
          provisoire blab bla bla dla pookie tu connais la chanson
        </DebateArticleCard.Description>
        <DebateArticleCard.Origin>BFM TV</DebateArticleCard.Origin>
      </DebateArticleCard>
    );
  })
  .add('with title only', () => {
    return (
      <DebateArticleCard maxWidth={365}>
        <DebateArticleCard.Title>
          Que pèse vraiment le marché du cannabis en France ?
        </DebateArticleCard.Title>
      </DebateArticleCard>
    );
  })
  .add('without description', () => {
    return (
      <DebateArticleCard
        maxWidth={365}
        illustration="https://picsum.photos/536/354"
        publishedAt="19 oct 2020">
        <DebateArticleCard.Title>
          Que pèse vraiment le marché du cannabis en France ?
        </DebateArticleCard.Title>
        <DebateArticleCard.Origin>BFM TV</DebateArticleCard.Origin>
      </DebateArticleCard>
    );
  })
  .add('without description and origin', () => {
    return (
      <DebateArticleCard
        maxWidth={365}
        illustration="https://picsum.photos/536/354"
        publishedAt="19 oct 2020">
        <DebateArticleCard.Title>
          Que pèse vraiment le marché du cannabis en France ?
        </DebateArticleCard.Title>
      </DebateArticleCard>
    );
  })
  .add('grouped', () => {
    return (
      <Grid gridGap={4} autoFill={{ min: '365px', max: '1fr' }}>
        <DebateArticleCard publishedAt="19 oct 2020" illustration="https://picsum.photos/536/354">
          <DebateArticleCard.Title>
            Que pèse vraiment le marché du cannabis en France ?
          </DebateArticleCard.Title>
          <DebateArticleCard.Origin>BFM TV</DebateArticleCard.Origin>
        </DebateArticleCard>
        <DebateArticleCard
          publishedAt="il y a 19 heures"
          illustration="https://picsum.photos/536/354">
          <DebateArticleCard.Title>
            Que pèse vraiment le marché du cannabis en France ?
          </DebateArticleCard.Title>
          <DebateArticleCard.Origin>BFM TV</DebateArticleCard.Origin>
        </DebateArticleCard>
        <DebateArticleCard
          publishedAt="un jour peut être"
          illustration="https://picsum.photos/536/354">
          <DebateArticleCard.Title>
            Que pèse vraiment le marché du cannabis en France ?
          </DebateArticleCard.Title>
          <DebateArticleCard.Origin>BFM TV</DebateArticleCard.Origin>
        </DebateArticleCard>
      </Grid>
    );
  });
