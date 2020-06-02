/* @flow */
/* eslint-env jest */
import React from 'react';
import { mount, shallow } from 'enzyme';
import SearchableDropdownSelect from '~ui/SearchableDropdownSelect';
import DropdownSelect from '~ui/DropdownSelect';
import DropdownSelectChoice from '~ui/DropdownSelect/choice';
import Loader from '~ui/FeedbacksIndicators/Loader';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const loadOptionsEmptyResultsMock = jest.fn().mockResolvedValue([]);

describe('<SearchableDropdownSelect />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <SearchableDropdownSelect
        searchPlaceholder="Rechercher un animé"
        loadOptions={loadOptionsEmptyResultsMock}
        title="Votre animé préféré"
        noResultsMessage="Aucun animé trouvé">
        {results =>
          results.map(anime => (
            <DropdownSelect.Choice value={anime.id}>{anime.title}</DropdownSelect.Choice>
          ))
        }
      </SearchableDropdownSelect>,
    );
    expect(wrapper.find(DropdownSelectChoice).exists()).toBe(false);

    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with disabled searchable dropdown', () => {
    const wrapper = shallow(
      <SearchableDropdownSelect
        disabled
        searchPlaceholder="Rechercher un animé"
        loadOptions={loadOptionsEmptyResultsMock}
        title="Votre animé préféré"
        noResultsMessage="Aucun animé trouvé">
        {results =>
          results.map(anime => (
            <DropdownSelect.Choice value={anime.id}>{anime.title}</DropdownSelect.Choice>
          ))
        }
      </SearchableDropdownSelect>,
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should correctly render when defaultOptions are provided', () => {
    const DEFAULT_OPTIONS = [
      {
        id: 'default1',
        title: 'Default anime one',
      },
      {
        id: 'default2',
        title: 'Default anime two',
      },
    ];

    const wrapper = shallow(
      <SearchableDropdownSelect
        searchPlaceholder="Rechercher un animé"
        loadOptions={loadOptionsEmptyResultsMock}
        title="Votre animé préféré"
        defaultOptions={DEFAULT_OPTIONS}
        noResultsMessage="Aucun animé trouvé">
        {results =>
          results.map(anime => (
            <DropdownSelect.Choice value={anime.id}>{anime.title}</DropdownSelect.Choice>
          ))
        }
      </SearchableDropdownSelect>,
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should correctly set the values based on defaultOptions for the DropdownSelect.Choice', () => {
    const DEFAULT_OPTIONS = [
      {
        id: 'default1',
        title: 'Default anime one',
      },
      {
        id: 'default2',
        title: 'Default anime two',
      },
    ];
    const wrapper = mount(
      <SearchableDropdownSelect
        searchPlaceholder="Rechercher un animé"
        loadOptions={loadOptionsEmptyResultsMock}
        title="Votre animé préféré"
        defaultOptions={DEFAULT_OPTIONS}
        noResultsMessage="Aucun animé trouvé">
        {results =>
          results.map(anime => (
            <DropdownSelect.Choice value={anime.id}>{anime.title}</DropdownSelect.Choice>
          ))
        }
      </SearchableDropdownSelect>,
    );

    expect(wrapper.find(DropdownSelectChoice).exists()).toBe(true);
    expect(
      wrapper
        .find(DropdownSelectChoice)
        .at(0)
        .prop('value'),
    ).toBe('default1');
    expect(
      wrapper
        .find(DropdownSelectChoice)
        .at(1)
        .prop('value'),
    ).toBe('default2');
  });

  it('should correctly search and retrieve items', async () => {
    const ANIMES_FROM_BACKEND = [
      {
        id: 'anime1',
        title: 'My first anime from backend',
      },
      {
        id: 'anime2',
        title: 'My second anime from backend',
      },
      {
        id: 'anime3',
        title: 'My third anime from backend',
      },
    ];
    const loadAnimesFromBackendMock = jest.fn(inputValue =>
      Promise.resolve(ANIMES_FROM_BACKEND.filter(anime => anime.title.includes(inputValue))),
    );

    const wrapper = mount(
      <SearchableDropdownSelect
        debounceMs={0}
        searchPlaceholder="Rechercher un animé"
        loadOptions={loadAnimesFromBackendMock}
        title="Trier par"
        noResultsMessage="Aucun animé trouvé">
        {results =>
          results.map(anime => (
            <DropdownSelect.Choice value={anime.id}>{anime.title}</DropdownSelect.Choice>
          ))
        }
      </SearchableDropdownSelect>,
    );

    // Trigger a "My first anime" search
    expect(wrapper.find(DropdownSelectChoice).exists()).toBe(false);
    wrapper.find('input').simulate('change', { target: { value: 'My first anime' } });
    expect(wrapper.find(DropdownSelectChoice).exists()).toBe(false);
    expect(wrapper.find(Loader).exists()).toBe(true);
    await wait(1);
    wrapper.update();
    expect(wrapper.find(Loader).exists()).toBe(false);
    expect(wrapper.find(DropdownSelectChoice).exists()).toBe(true);
    expect(
      wrapper
        .find(DropdownSelectChoice)
        .at(0)
        .prop('value'),
    ).toBe('anime1');

    // Trigger a "My third anime" search
    wrapper.find('input').simulate('change', { target: { value: 'My third anime' } });
    expect(wrapper.find(Loader).exists()).toBe(true);
    await wait(1);
    wrapper.update();
    expect(wrapper.find(Loader).exists()).toBe(false);
    expect(wrapper.find(DropdownSelectChoice).exists()).toBe(true);
    expect(
      wrapper
        .find(DropdownSelectChoice)
        .at(0)
        .prop('value'),
    ).toBe('anime3');

    // Trigger a "My" search
    wrapper.find('input').simulate('change', { target: { value: 'My' } });
    expect(wrapper.find(Loader).exists()).toBe(true);
    await wait(1);
    wrapper.update();
    expect(wrapper.find(Loader).exists()).toBe(false);
    expect(wrapper.find(DropdownSelectChoice).exists()).toBe(true);
    expect(
      wrapper
        .find(DropdownSelectChoice)
        .at(0)
        .prop('value'),
    ).toBe('anime1');
    expect(
      wrapper
        .find(DropdownSelectChoice)
        .at(1)
        .prop('value'),
    ).toBe('anime2');
    expect(
      wrapper
        .find(DropdownSelectChoice)
        .at(2)
        .prop('value'),
    ).toBe('anime3');
  });
});
