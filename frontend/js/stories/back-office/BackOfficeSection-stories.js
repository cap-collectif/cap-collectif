// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Section from '../../components/Ui/BackOffice/Section';

storiesOf('Back office|Section', module).add('default case', () => {
  return (
    <div className="sonata-ba-form">
      <form>
        <Section title="Évènement">
          <div className="sonata-ba-collapsed-fields">
            <div className="form-group">
              <label className="controle-label">Titre *</label>
              <div>
                <input type="text" value="Titre de l'évènement" className="form-control" />
              </div>
            </div>
          </div>
        </Section>
      </form>
    </div>
  );
});
