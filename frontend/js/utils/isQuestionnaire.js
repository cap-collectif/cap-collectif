// @flow
import { TYPE_FORM } from '~/constants/FormConstants';

const isQuestionnaire = (typeForm: $Values<typeof TYPE_FORM> = TYPE_FORM.DEFAULT): boolean =>
  typeForm === TYPE_FORM.QUESTIONNAIRE;

export default isQuestionnaire;
