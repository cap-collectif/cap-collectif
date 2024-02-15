import {FormLabel} from "@cap-collectif/ui";
import {FieldInput, FormControl} from "@cap-collectif/form";
import * as React from "react";
import {useFormContext} from "react-hook-form";
import {useIntl} from "react-intl";

type Props = {
  setHelpMessage: (message: string) => void
}

const LabelInput: React.FC<Props> = ({setHelpMessage}) => {

  const intl = useIntl();
  const {control} = useFormContext();

  return (
    <FormControl
      name="label"
      control={control}
      isRequired
      mb={6}
      onFocus={() => {
        setHelpMessage('step.create.label.helpText')
      }}
      onBlur={() => {
        setHelpMessage(null)
      }}
    >
      <FormLabel htmlFor="label" label={intl.formatMessage({id: 'step-label-name'})}/>
      <FieldInput
        id="label"
        name="label"
        control={control}
        type="text"
        placeholder={intl.formatMessage({id: 'step-label-name-placeholder'})}
      />
    </FormControl>
  )
}

export default LabelInput