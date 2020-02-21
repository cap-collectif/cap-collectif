// @flow
export type Value = {
  labels: Array<string>,
  other?: string | null,
};

export type Field = {
  id: string,
  label: string,
  description?: string,
  color?: string,
  image?: {
    url: string,
  },
  useIdAsValue?: boolean,
};

export type Fields = {
  id: string,
  type: string,
  isOtherAllowed: boolean,
  choices: Array<Field>,
  checked?: boolean,
  helpText?: string,
  description?: string,
};
