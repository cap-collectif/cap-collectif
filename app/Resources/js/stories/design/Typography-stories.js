// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from 'styled-components';
import { FormattedHTMLMessage } from 'react-intl';

const Container = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid #e3e3e3;
  display: flex;

  &:first-child {
    padding-top: 0;
  }
`;

const FlexContainer = styled.div`
  flex: 1 1;

  &:first-child {
    margin-right: 20px;
  }

  &:last-child {
    margin-left: 20px;
  }
`;

const typos = [
  {
    tag: '<h1>',
    color: 'Default : #333333, client custom : "Texte du Titre 1 (h1)"',
    example: '<h1>h1. Lorem ipsum dolor.</h1>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '36px',
    fontWeight: '400',
    lineHeight: '1.1',
    marginTop: '0',
    marginBottom: '30px',
  },
  {
    tag: '<h2>',
    color: 'Default : #007c91, client custom : "Texte du titre 2 (h2)"',
    example: '<h2>h2. Lorem ipsum dolor.</h2>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '30px',
    fontWeight: '400',
    lineHeight: '1.1',
    marginTop: '30px',
    marginBottom: '20px',
  },
  {
    tag: '<h3>',
    color: 'Default : #00acc1, client custom : "Texte du titre 3 (h3)"',
    example: '<h3>h3. Lorem ipsum dolor.</h3>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '24px',
    fontWeight: '400',
    lineHeight: '1.1',
    marginTop: '20px',
    marginBottom: '10px',
  },
  {
    tag: '<h4>',
    color: 'Default : #333333, client custom : "Texte du titre 4 (h4)"',
    example: '<h4>h4. Lorem ipsum dolor.</h4>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '18px',
    fontWeight: '400',
    lineHeight: '1.1',
    marginTop: '20px',
    marginBottom: '10px',
  },
  {
    tag: '<h5>',
    color: 'Default : #333333, client custom : "Texte du titre 5 (h5)"',
    example: '<h5>h5. Lorem ipsum dolor.</h5>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '14px;',
    fontWeight: '400',
    lineHeight: '1.1',
    marginTop: '10px',
    marginBottom: '10px',
  },
  {
    tag: '<h6>',
    color: 'Default : #333333, client custom : "Texte du titre 6 (h6)"',
    example: '<h6>h6. Lorem ipsum dolor.</h6>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '12px;',
    fontWeight: '400',
    lineHeight: '1.1',
    marginTop: '10px',
    marginBottom: '10px',
  },
  {
    tag: '<p>',
    color: '#333333',
    example:
      '<p>Paragraph. Lorem ipsum dolor sit amet, consecteuetur adipsi elit, sed do euismod tempor incididunt adipsi elit, sed do adipsi elit, sed do euismod tempor incididunt ut labore et dolore magna aliqua</p>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.43',
    marginTop: '0',
    marginBottom: '10px',
  },
  {
    tag: '<anyTag className="small">',
    color: '#333333',
    example:
      '<span class="small">Small text. Lorem ipsum dolor sit amet, consecteuetur adipsi elit, sed do euismod tempor consecteuetur adipsi elit, sed consecteuetur adipsi elit, sed do euismod tempor incididunt ut labore et dolore magna aliqua</span>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '85%',
    fontWeight: '400',
    lineHeight: '1.43',
    marginTop: '0',
    marginBottom: '0',
  },
  {
    tag: '<anyTag className="excerpt">',
    color: '#707070',
    example:
      '<span class="excerpt">Excerpt text. Lorem ipsum dolor sit amet, consecteuetur adipsi elit, sed do euismod tempor consecteuetur adipsi elit, sed consecteuetur adipsi elit, sed do euismod tempor incididunt ut labore et dolore magna aliqua</span>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '16px;',
    fontWeight: '400',
    lineHeight: '1.43',
    marginTop: '0',
    marginBottom: '0',
  },
  {
    tag: '<b>',
    color: '#333333',
    example:
      '<b>Bold text. Lorem ipsum dolor sit amet, consecteuetur adipsi elit, sed do euismod tempor incididunt ut labore et sed do euismod tempor incididunt sed do euismod tempor incididunt ut labore et dolore magna aliqua</b>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '16px;',
    fontWeight: '400',
    lineHeight: '1.43',
    marginTop: '0',
    marginBottom: '0',
  },
  {
    tag: '<i>',
    color: '#333333',
    example:
      '<i>Italic text. Lorem ipsum dolor sit amet, consecteuetur adipsi elit, sed do euismod tempor incididunt ut labore et dolore magna aliquatempor incididunt ut labore et tempor incididunt ut labore et dolore magna aliqua</i>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '16px;',
    fontWeight: '400',
    lineHeight: '1.43',
    marginTop: '0',
    marginBottom: '0',
  },
  {
    tag: '<a>',
    color: 'Default : #337ab7, client custom : "Lien"',
    example:
      '<a>Link. Lorem ipsum dolor sit amet, consecteuetur adipsi elit, sed do euismod tempor incididunt ut labore et dolore magna aliquatempor incididunt ut labore et tempor incididunt ut labore et dolore magna aliqua</a>',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '16px;',
    fontWeight: '400',
    lineHeight: '1.43',
    marginTop: '0',
    marginBottom: '0',
  },
];

storiesOf('Design|Typography', module).add(
  'Typography',
  () => (
    <div>
      {typos.map(typo => (
        <Container>
          <FlexContainer>
            <FormattedHTMLMessage id={typo.example} />
          </FlexContainer>
          <FlexContainer>
            <span>
              Tag :{' '}
              <b>
                <code>{typo.tag}</code>
              </b>
            </span>
            <br />
            <span>
              Font family : <b>{typo.fontFamily}</b>
            </span>
            <br />
            <span>
              Font size : <b>{typo.fontSize}</b>
            </span>
            <br />
            <span>
              Font Weight : <b>{typo.fontWeight}</b>
            </span>
            <br />
            <span>
              Line height : <b>{typo.lineHeight}</b>
            </span>
            <br />
            <span>
              Margin top : <b>{typo.marginTop}</b>
            </span>
            <br />
            <span>
              Margin bottom : <b>{typo.marginBottom}</b>
            </span>
            <br />
            <span>
              Color : <b>{typo.color}</b>
            </span>
            <br />
          </FlexContainer>
        </Container>
      ))}
    </div>
  ),
  {
    info: {
      source: false,
      propTables: null,
    },
    options: {
      showAddonPanel: false,
    },
  },
);
