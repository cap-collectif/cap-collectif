// @flow

export const TYPE_FORM: {
  DEFAULT: 'default',
  QUESTIONNAIRE: 'questionnaire',
} = {
  DEFAULT: 'default',
  QUESTIONNAIRE: 'questionnaire',
};

export const QUESTION_TYPE_WITH_JUMP = ['checkbox', 'radio', 'button', 'ranking', 'select'];

/**
 * @type {*|RegExp}
 * Accept letters lowercase and uppercase
 * Accept digits
 * Accept spaces
 * Accept Latin-1 Supplement (exclude ×÷) (source: https://stackoverflow.com/questions/20690499/concrete-javascript-regex-for-accented-characters-diacritics)
 * Accept symbols "_", "-", "·", and "'"
 */
export const REGEX_USERNAME = RegExp("^[a-zA-Z0-9_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F-·' ]+$");
