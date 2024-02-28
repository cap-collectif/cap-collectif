import React from 'react';
import {useFormContext} from "react-hook-form";
import TextEditor from "../../Form/TextEditor/TextEditor";
import {Button, CapUIIcon, Menu, Text} from "@cap-collectif/ui";
import ProposalFormFormNeededInfoList from "./ProposalFormFormNeededInfoList";
import {addRequiredInfo, getDropDownOptions} from "./ProposalFormForm.utils";
import {useIntl} from "react-intl";
import {graphql, useFragment} from "react-relay";
import {ProposalForm_query$key} from "../../../__generated__/ProposalForm_query.graphql";
import {useCollectStep} from "./CollectStepContext";

type Props = {
  defaultLocale?: string
  query: ProposalForm_query$key
};


const QUERY_FRAGMENT = graphql`
  fragment ProposalForm_query on Query {
    ...ProposalFormFormNeededInfoList_query
  }
`
const ProposalForm: React.FC<Props> = ({defaultLocale, query: queryRef}) => {
  const query = useFragment(QUERY_FRAGMENT, queryRef)
  const intl = useIntl();
  const {control, setValue, watch} = useFormContext();
  const {proposalFormKey} = useCollectStep();
  const values = watch(proposalFormKey);

  if (proposalFormKey === 'form_model' && !values) {
    return null
  }

  const dropDownList = getDropDownOptions(values, intl);

  return (
    <>
      <TextEditor
        name={`${proposalFormKey}.description`}
        label={intl.formatMessage({
          id: 'admin.fields.proposal_form.introduction',
        })}
        platformLanguage={defaultLocale}
        selectedLanguage={defaultLocale}
        placeholder={intl.formatMessage({
          id: 'admin.fields.proposal_form.introduction.placeholder',
        })}
        key={values.id}
      />
      <Text mb={4}>{intl.formatMessage({id: 'admin.proposal.form.needed.info'})}</Text>
      <ProposalFormFormNeededInfoList
        control={control}
        defaultLocale={defaultLocale}
        setValue={setValue}
        query={query}
        values={values}
      />
      {dropDownList.length > 0 && (
        <Menu
          disclosure={
            <Button variant="secondary" rightIcon={CapUIIcon.ArrowDownO} id="add-needed-infos">
              {intl.formatMessage({id: 'admin.global.add'})}
            </Button>
          }
          onChange={selected => {
            addRequiredInfo(selected.value, setValue, proposalFormKey);
          }}>
          <Menu.List>
            {dropDownList.map(dropDownItem => (
              <Menu.Item key={dropDownItem.value} value={dropDownItem}>
                {dropDownItem.label}
              </Menu.Item>
            ))}
          </Menu.List>
        </Menu>
      )}
    </>
  );
};

export default ProposalForm;