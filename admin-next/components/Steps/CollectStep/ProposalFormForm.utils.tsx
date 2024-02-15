import { IntlShape } from 'react-intl';
import { UseFormSetValue } from 'react-hook-form/dist/types/form';
import { FormValues } from '@components/Steps/CollectStep/CollectStepForm';
import {FormKeyType} from "./CollectStepContext";

export const getDropDownOptions: (
    values: any,
    intl: IntlShape,
) => { label: string; value: string }[] = (values, intl) => {
    const initial = [];
    if (!values.usingSummary) {
        initial.push({
            label: intl.formatMessage({ id: 'proposal_form.summary' }),
            value: 'usingSummary',
        });
    }
    if (!values.usingDescription) {
        initial.push({
            label: intl.formatMessage({ id: 'proposal_form.description' }),
            value: 'usingDescription',
        });
    }
    if (!values.usingIllustration) {
        initial.push({
            label: intl.formatMessage({ id: 'proposal_form.illustration' }),
            value: 'usingIllustration',
        });
    }
    if (!values.usingThemes) {
        initial.push({
            label: intl.formatMessage({ id: 'proposal_form.theme' }),
            value: 'usingThemes',
        });
    }
    if (!values.usingCategories) {
        initial.push({
            label: intl.formatMessage({ id: 'proposal_form.category' }),
            value: 'usingCategories',
        });
    }
    if (!values.usingAddress) {
        initial.push({
            label: intl.formatMessage({ id: 'proposal_form.address' }),
            value: 'usingAddress',
        });
    }
    if (!values.usingDistrict) {
        initial.push({
            label: intl.formatMessage({ id: 'proposal_form.districts' }),
            value: 'usingDistrict',
        });
    }
    return initial;
};

export const deleteRequiredInfo = (info: string, setValue: UseFormSetValue<FormValues>, formKey: FormKeyType): void => {
    if (info === 'summary') {
        setValue(`${formKey}.usingSummary`, false);
        setValue(`${formKey}.summaryHelpText`, null);
    }
    if (info === 'illustration') {
        setValue(`${formKey}.usingIllustration`, false);
        setValue(`${formKey}.illustrationHelpText`, null);
    }
    if (info === 'theme') {
        setValue(`${formKey}.usingThemes`, false);
        setValue(`${formKey}.themeHelpText`, null);
        setValue(`${formKey}.themeMandatory`, false);
    }
    if (info === 'categories') {
        setValue(`${formKey}.usingCategories`, false);
    }
    if (info === 'address') {
        setValue(`${formKey}.usingAddress`, false);
        setValue(`${formKey}.addressHelpText`, null);
    }
    if (info === 'district') {
        setValue(`${formKey}.usingDistrict`, false);
    }
    if (info === 'description') {
        setValue(`${formKey}.usingDescription`, false);
        setValue(`${formKey}.descriptionHelpText`, null);
        setValue(`${formKey}.descriptionMandatory`, false);
    }
};
export const addRequiredInfo = (info: string, setValue: UseFormSetValue<FormValues>, formKey: FormKeyType): void => {
    if (info === 'usingSummary') {
        setValue(`${formKey}.usingSummary`, true);
        setValue(`${formKey}.summaryHelpText`, null);
    }
    if (info === 'usingDescription') {
        setValue(`${formKey}.usingDescription`, true);
    }
    if (info === 'usingIllustration') {
        setValue(`${formKey}.usingIllustration`, true);
        setValue(`${formKey}.illustrationHelpText`, null);
    }
    if (info === 'usingThemes') {
        setValue(`${formKey}.usingThemes`, true);
        setValue(`${formKey}.themeHelpText`, null);
        setValue(`${formKey}.themeMandatory`, false);
    }
    if (info === 'usingCategories') {
        setValue(`${formKey}.usingCategories`, true);
        setValue(`${formKey}.categories`, []);
        setValue(`${formKey}.categoryMandatory`, false);
    }
    if (info === 'usingAddress') {
        setValue(`${formKey}.usingAddress`, true);
        setValue(`${formKey}.addressHelpText`, null);
    }
    if (info === 'usingDistrict') {
        setValue(`${formKey}.usingDistrict`, true);
        setValue(`${formKey}.districts`, []);
        setValue(`${formKey}.districtHelpText`, null);
        setValue(`${formKey}.districtMandatory`, false);
    }
};
export const resetForm = (setValue: UseFormSetValue<FormValues>, formKey: FormKeyType): void => {
    setValue(`${formKey}.title`, null);
    setValue(`${formKey}.titleHelpText`, null);
    setValue(`${formKey}.description`, null);
    setValue(`${formKey}.usingDescription`, false);
    setValue(`${formKey}.usingSummary`, false);
    setValue(`${formKey}.summaryHelpText`, null);
    setValue(`${formKey}.usingIllustration`, false);
    setValue(`${formKey}.illustrationHelpText`, null);
    setValue(`${formKey}.usingThemes`, false);
    setValue(`${formKey}.themeHelpText`, null);
    setValue(`${formKey}.themeMandatory`, false);
    setValue(`${formKey}.usingCategories`, false);
    setValue(`${formKey}.categories`, []);
    setValue(`${formKey}.categoryMandatory`, false);
    setValue(`${formKey}.usingAddress`, false);
    setValue(`${formKey}.addressHelpText`, null);
    setValue(`${formKey}.usingDistrict`, false);
    setValue(`${formKey}.districts`, null);
    setValue(`${formKey}.districtHelpText`, null);
    setValue(`${formKey}.districtMandatory`, false);
};
