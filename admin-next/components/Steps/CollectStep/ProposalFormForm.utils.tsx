import { IntlShape } from 'react-intl';
import { UseFormSetValue } from 'react-hook-form/dist/types/form';
import { FormValues } from '@components/Steps/CollectStep/CollectStepForm';

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

export const deleteRequiredInfo = (info: string, setValue: UseFormSetValue<FormValues>): void => {
    if (info === 'summary') {
        setValue('form.usingSummary', false);
        setValue('form.summaryHelpText', null);
    }
    if (info === 'illustration') {
        setValue('form.usingIllustration', false);
        setValue('form.illustrationHelpText', null);
    }
    if (info === 'theme') {
        setValue('form.usingThemes', false);
        setValue('form.themeHelpText', null);
        setValue('form.themeMandatory', false);
    }
    if (info === 'categories') {
        setValue('form.usingCategories', false);
    }
    if (info === 'address') {
        setValue('form.usingAddress', false);
        setValue('form.addressHelpText', null);
    }
    if (info === 'district') {
        setValue('form.usingDistrict', false);
    }
    if (info === 'description') {
        setValue('form.usingDescription', false);
        setValue('form.descriptionHelpText', null);
        setValue('form.descriptionMandatory', false);
    }
};
export const addRequiredInfo = (info: string, setValue: UseFormSetValue<FormValues>): void => {
    if (info === 'usingSummary') {
        setValue('form.usingSummary', true);
        setValue('form.summaryHelpText', null);
    }
    if (info === 'usingDescription') {
        setValue('form.usingDescription', true);
    }
    if (info === 'usingIllustration') {
        setValue('form.usingIllustration', true);
        setValue('form.illustrationHelpText', null);
    }
    if (info === 'usingThemes') {
        setValue('form.usingThemes', true);
        setValue('form.themeHelpText', null);
        setValue('form.themeMandatory', false);
    }
    if (info === 'usingCategories') {
        setValue('form.usingCategories', true);
        setValue('form.categories', []);
        setValue('form.categoryMandatory', false);
    }
    if (info === 'usingAddress') {
        setValue('form.usingAddress', true);
        setValue('form.addressHelpText', null);
    }
    if (info === 'usingDistrict') {
        setValue('form.usingDistrict', true);
        setValue('form.districts', []);
        setValue('form.districtHelpText', null);
        setValue('form.districtMandatory', false);
    }
};
export const resetForm = (setValue: UseFormSetValue<FormValues>): void => {
    setValue('form.title', null);
    setValue('form.titleHelpText', null);
    setValue('form.description', null);
    setValue('form.usingDescription', false);
    setValue('form.usingSummary', false);
    setValue('form.summaryHelpText', null);
    setValue('form.usingIllustration', false);
    setValue('form.illustrationHelpText', null);
    setValue('form.usingThemes', false);
    setValue('form.themeHelpText', null);
    setValue('form.themeMandatory', false);
    setValue('form.usingCategories', false);
    setValue('form.categories', []);
    setValue('form.categoryMandatory', false);
    setValue('form.usingAddress', false);
    setValue('form.addressHelpText', null);
    setValue('form.usingDistrict', false);
    setValue('form.districts', null);
    setValue('form.districtHelpText', null);
    setValue('form.districtMandatory', false);
};
