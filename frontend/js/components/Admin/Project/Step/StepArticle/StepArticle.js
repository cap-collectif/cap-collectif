// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { arrayPush, Field, FieldArray, formValueSelector } from 'redux-form';
import { FormattedMessage, useIntl } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import renderComponent from '~/components/Form/Field';
import Button from '~ds/Button/Button';
import { renderLabel } from '~/components/Admin/Project/Content/ProjectContentAdminForm';
import type { Dispatch, GlobalState } from '~/types';
import { stepFormName } from '~/components/Admin/Project/Step/ProjectAdminStepForm';
import { ICON_NAME } from '~ds/Icon/Icon';

export type Articles = Array<{
  id: ?string,
  url: ?string,
}>;

type Props = {|
  dispatch: Dispatch,
  articles: Articles,
|};

const renderArticles = ({ fields: articles }) =>
  articles.map((article, idx) => (
    <Field
      key={`article-${idx}`}
      type="text"
      name={`${article}.url`}
      id={`step-article-${idx}`}
      label={<FormattedMessage id="global.link" />}
      placeholder="placeholderText.debat.articleLink"
      component={renderComponent}
    />
  ));

export const StepArticle = ({ dispatch, articles }: Props) => {
  const intl = useIntl();

  React.useEffect(() => {
    if (articles.length === 0) {
      dispatch(
        arrayPush(stepFormName, 'articles', {
          id: null,
          url: '',
        }),
      );
    }
  }, [articles.length, dispatch]);

  return (
    <Flex direction="column" spacing={4}>
      <Text color="gray.900">
        {renderLabel('related.articles', intl, 'helpText.add.press.articles')}
      </Text>

      <FieldArray name="articles" form={stepFormName} component={renderArticles} />

      <Button
        variant="tertiary"
        leftIcon={ICON_NAME.ADD}
        onClick={() =>
          dispatch(
            arrayPush(stepFormName, 'articles', {
              id: null,
              url: '',
            }),
          )
        }
        alignSelf="flex-start">
        <FormattedMessage id="add.article" />
      </Button>
    </Flex>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  articles: formValueSelector(stepFormName)(state, 'articles') || [],
});

export default connect(mapStateToProps)(StepArticle);
