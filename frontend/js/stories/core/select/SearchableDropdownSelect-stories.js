// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { number, text } from 'storybook-addon-knobs';
import SearchableDropdownSelect from '~ui/SearchableDropdownSelect';
import DropdownSelect from '~ui/DropdownSelect';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

const DEFAULT_ANIMES = [
  {
    mal_id: 'mal1',
    image_url: 'https://picsum.photos/32/32',
    title: "L'animé défaut 1",
  },
  {
    mal_id: 'mal2',
    image_url: 'https://picsum.photos/32/32',
    title: "L'animé défaut 2",
  },
  {
    mal_id: 'mal3',
    image_url: 'https://picsum.photos/32/32',
    title: "L'animé défaut 3",
  },
  {
    mal_id: 'mal4',
    image_url: 'https://picsum.photos/32/32',
    title: "L'animé défaut 4",
  },
];

const debounceKnob = () => number('Debounce ms', 400);
const searchPlaceholderKnob = () => text('Search placeholder', 'Rechercher un animé');
const noResultsMessageKnob = () => text('No results message', 'Aucun résultat');

const promiseOptions = inputValue =>
  new Promise(async resolve => {
    const response = await fetch(`https://api.jikan.moe/v3/search/anime?q=${inputValue}&limit=16`);
    const json = await response.json();
    resolve(json.results);
  });

storiesOf('Core|Select/SearchableDropdownSelect', module)
  .add('default', () => {
    return (
      <SearchableDropdownSelect
        isMultiSelect
        debounceMs={debounceKnob()}
        searchPlaceholder={searchPlaceholderKnob()}
        noResultsMessage={noResultsMessageKnob()}
        searchInputIcon={<i className="cap cap-book-1" />}
        shouldOverflow
        loadOptions={promiseOptions}
        defaultOptions={DEFAULT_ANIMES}
        title="Vos animés préférés">
        {results =>
          results.map(r => (
            <DropdownSelect.Choice key={r.mal_id} value={r.mal_id}>
              {r.title}
            </DropdownSelect.Choice>
          ))
        }
      </SearchableDropdownSelect>
    );
  })
  .add('with message on top', () => {
    return (
      <SearchableDropdownSelect
        isMultiSelect
        debounceMs={debounceKnob()}
        searchPlaceholder={searchPlaceholderKnob()}
        noResultsMessage={noResultsMessageKnob()}
        searchInputIcon={<i className="cap cap-book-1" />}
        shouldOverflow
        message={
          <DropdownSelect.Message icon={<Icon name={ICON_NAME.information} />}>
            <p>Je suis un beau message avertissant que The Promised Neverland est très cool</p>
          </DropdownSelect.Message>
        }
        loadOptions={promiseOptions}
        defaultOptions={DEFAULT_ANIMES}
        title="Vos animés préférés">
        {results =>
          results.map(r => (
            <DropdownSelect.Choice key={r.mal_id} value={r.mal_id}>
              {r.title}
            </DropdownSelect.Choice>
          ))
        }
      </SearchableDropdownSelect>
    );
  })
  .add('without default options', () => {
    return (
      <SearchableDropdownSelect
        isMultiSelect
        debounceMs={debounceKnob()}
        searchPlaceholder={searchPlaceholderKnob()}
        noResultsMessage={noResultsMessageKnob()}
        searchInputIcon={<i className="cap cap-book-1" />}
        shouldOverflow
        loadOptions={promiseOptions}
        title="Vos animés préférés">
        {results =>
          results.map(r => (
            <DropdownSelect.Choice key={r.mal_id} value={r.mal_id}>
              {r.title}
            </DropdownSelect.Choice>
          ))
        }
      </SearchableDropdownSelect>
    );
  })
  .add('with a custom row', () => {
    return (
      <SearchableDropdownSelect
        isMultiSelect
        debounceMs={debounceKnob()}
        defaultOptions={DEFAULT_ANIMES}
        searchPlaceholder={searchPlaceholderKnob()}
        noResultsMessage={noResultsMessageKnob()}
        searchInputIcon={<i className="cap cap-book-1" />}
        shouldOverflow
        loadOptions={promiseOptions}
        title="Vos animés préférés">
        {results =>
          results.map(r => (
            <DropdownSelect.Choice key={r.mal_id} value={r.mal_id}>
              <img
                width={32}
                height={32}
                style={{
                  borderRadius: '100%',
                  marginRight: '10px',
                }}
                src={r.image_url}
                alt=""
              />
              {r.title}
            </DropdownSelect.Choice>
          ))
        }
      </SearchableDropdownSelect>
    );
  });
