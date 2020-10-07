// @flow
/* eslint-env jest */

import { clearQueryUrl, getFieldsFromUrl, updateQueryUrl } from '~/shared/utils/analysis-filters';

describe('shared/utils/analysis-filters', () => {
  beforeAll(() => {
    delete global.window.history;
    global.window.history = {
      replaceState: jest.fn(),
    };
    delete global.window.location;
    global.window.location = {
      href: null,
    };
  });
  describe('getFieldsFromUrl', () => {
    it('should correctly get fields from a given URL', () => {
      const url = new URL('https://genshin.mihoyo.com/fr?rem=chan&genshin=cool');
      expect(getFieldsFromUrl(url)).toEqual({
        rem: 'chan',
        genshin: 'cool',
      });
    });

    it('should correctly returns an empty object when no querystring in URL', () => {
      let url = new URL('https://genshin.mihoyo.com/fr?');
      expect(getFieldsFromUrl(url)).toEqual({});
      url = new URL('https://genshin.mihoyo.com/fr');
      expect(getFieldsFromUrl(url)).toEqual({});
    });

    it('should correctly returns array fields when multiple keys in URL', () => {
      const url = new URL(
        'https://genshin.mihoyo.com/fr?waifus=rem&waifus=emilia&waifus=lisa&waifus=amber',
      );
      expect(getFieldsFromUrl(url)).toEqual({
        waifus: ['rem', 'emilia', 'lisa', 'amber'],
      });
    });
  });

  describe('getFieldsFromUrl options', () => {
    it('should correctly handle defaults', () => {
      const url = new URL('https://genshin.mihoyo.com/fr?rem=chan&genshin=cool');
      expect(getFieldsFromUrl(url, { default: { waifu: 'rem' } })).toEqual({
        rem: 'chan',
        genshin: 'cool',
        waifu: 'rem',
      });
    });
    it('should correctly handle whitelist', () => {
      const url = new URL('https://genshin.mihoyo.com/fr?rem=chan&genshin=cool');
      expect(getFieldsFromUrl(url, { whitelist: ['genshin'] })).toEqual({
        genshin: 'cool',
      });
    });
    it('should correctly handle blacklist', () => {
      const url = new URL('https://genshin.mihoyo.com/fr?rem=chan&genshin=cool');
      expect(getFieldsFromUrl(url, { blacklist: ['genshin'] })).toEqual({
        rem: 'chan',
      });
    });
  });

  describe('updateQueryUrl', () => {
    it('should correctly set a new key in the URL', () => {
      const url = new URL('https://genshin.mihoyo.com/fr');
      expect(url.searchParams.get('waifu')).toBeNull();
      updateQueryUrl(url, 'waifu', { value: 'rem' });
      expect(url.searchParams.get('waifu')).toEqual('rem');
    });
    it('should correctly append a value in the URL', () => {
      const url = new URL('https://genshin.mihoyo.com/fr?waifus=rem');
      expect(url.searchParams.getAll('waifus')).toEqual(['rem']);
      updateQueryUrl(url, 'waifus', { append: true, value: 'emilia' });
      expect(url.searchParams.getAll('waifus')).toEqual(['rem', 'emilia']);
    });
    it('should correctly delete a value in the URL', () => {
      const url = new URL('https://genshin.mihoyo.com/fr?waifu=rem&game=genshin');
      expect(url.searchParams.get('waifu')).toEqual('rem');
      updateQueryUrl(url, 'waifu', { delete: true });
      expect(url.searchParams.get('waifu')).toBeNull();
    });
    it('should correctly set an array value in the URL', () => {
      const url = new URL('https://genshin.mihoyo.com/fr?waifus=rem');
      expect(url.searchParams.getAll('waifus')).toEqual(['rem']);
      updateQueryUrl(url, 'waifus', { value: ['rem', 'ram', 'amber'] });
      expect(url.searchParams.getAll('waifus')).toEqual(['rem', 'ram', 'amber']);
    });
  });

  describe('clearQueryUrl', () => {
    it('should correctly clear the URL', () => {
      const url = new URL('https://genshin.mihoyo.com/fr?waifus=emilia&waifus=rem&game=genshin');
      expect(url.search).toBe('?waifus=emilia&waifus=rem&game=genshin');
      clearQueryUrl(url);
      expect(url.search).toBe('');
    });
  });
});
