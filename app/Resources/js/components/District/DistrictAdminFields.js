// @flow
import * as React from 'react';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Col, Row } from 'react-bootstrap';
import component from '../Form/Field';
import type { District } from '../../types';
import PanelBorderStyle from './Fields/PanelBorderStyle';
import PanelBackgroundStyle from './Fields/PanelBackgroundStyle';
import { isValid } from '../../services/GeoJsonValidator';

type Props = {|
  member: string,
  district: District,
  enableDesignFields: boolean,
  onChange?: Function,
|};

const isBorderEnable = district => district && district.border && district.border.enabled;

const isBackgroundEnable = district =>
  district && district.background && district.background.enabled;

const validateGeoJSON = function(geoJSON: string): ?string {
  if (geoJSON) {
    try {
      const decoded = JSON.parse(geoJSON);
      if (!isValid(decoded)) {
        return 'admin.fields.proposal.map.zone.geojson.invalid';
      }
    } catch (e) {
      return 'admin.fields.proposal.map.zone.geojson.invalid';
    }
  }
  return undefined;
};

const DistrictAdminFields = ({ member, district, enableDesignFields, onChange }: Props) => (
  <>
    <Field
      label="Titre"
      id={`${member}.name`}
      name={`${member}.name`}
      type="text"
      component={component}
    />
    {enableDesignFields ? (
      <>
        <Field
          label={<FormattedMessage id="admin.fields.proposal.map.zone" />}
          help={<FormattedMessage id="admin.fields.proposal.map.helpFormatGeojson" />}
          id={`${member}.geojson`}
          name={`${member}.geojson`}
          type="textarea"
          component={component}
          validate={validateGeoJSON}
          onChange={onChange ? onChange.bind(this) : undefined}
        />
        <Field
          children={<FormattedMessage id="admin.fields.proposal.map.displayZones" />}
          id={`${member}.displayedOnMap`}
          name={`${member}.displayedOnMap`}
          type="checkbox"
          normalize={val => !!val}
          component={component}
        />
        <h3>
          <FormattedMessage id="styles" />
        </h3>
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
    ) : null}
  </>
);

export default DistrictAdminFields;
