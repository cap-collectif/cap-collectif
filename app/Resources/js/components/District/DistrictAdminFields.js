// @flow
import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import component from '../Form/Field';
import PanelBackgroundStyle from './Fields/PanelBackgroundStyle';
import PanelBorderStyle from './Fields/PanelBorderStyle';
import type { District } from '../../types';

type Props = {
  member: string,
  district: District,
};

const isBorderEnable = district => district && district.border && district.border.enabled;

const isBackgroundEnable = district =>
  district && district.background && district.background.enabled;

const DistrictAdminFields = ({ member, district }: Props) => (
  <>
    <Field
      label="Titre"
      id={`${member}.name`}
      name={`${member}.name`}
      type="text"
      component={component}
    />
    <Field
      label={<FormattedMessage id="admin.fields.proposal.map.zone" />}
      help={<FormattedMessage id="admin.fields.proposal.map.helpFormatGeojson" />}
      id={`${member}.geojson`}
      name={`${member}.geojson`}
      type="textarea"
      component={component}
    />
    <Field
      children={<FormattedMessage id="admin.fields.proposal.map.displayZones" />}
      id={`${member}.displayedOnMap`}
      name={`${member}.displayedOnMap`}
      type="checkbox"
      normalize={val => !!val}
      component={component}
    />
    <h3>Styles</h3>
    <hr />
    <Row>
      <Col xs={12} md={6}>
        <PanelBorderStyle member={member} isEnabled={!!isBorderEnable(district)} />
      </Col>

      <Col xs={12} md={6}>
        <PanelBackgroundStyle member={member} isEnabled={!!isBackgroundEnable(district)} />
      </Col>
    </Row>
  </>
);

export default DistrictAdminFields;
