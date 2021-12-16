// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import NewEditor from './Editor';
import LegacyEditor from '../Form/Editor';
import LegacyEditorDs from '../Form/EditorDs';
import { uploadLocalImagePlugin, attachFilePlugin } from './plugins/upload';
import type { GlobalState } from '../../types';

// TODO: during the switch we can not add correct props, types
// Once the feature flag is removed, please fix this.
type Props = Object;

// Prevent usage via feature flag
class EditorBehindFeatureFlag extends React.Component<Props> {
  onAdminEditorChange = (name: string, state: {| html: string, raw: ?Object |}): void => {
    const { onChange } = this.props;

    if (onChange) {
      onChange(state.html);
    }
  };

  render() {
    const { isNewEditorEnabled, initialContent } = this.props;
    if (!isNewEditorEnabled) {
      return this.props.unstable__enableCapcoUiDs ? (
        <LegacyEditorDs {...this.props} value={initialContent} />
      ) : (
        <LegacyEditor {...this.props} value={initialContent} />
      );
    }
    return (
      <NewEditor
        {...this.props}
        uploadLocalImage={uploadLocalImagePlugin}
        attachFile={attachFilePlugin}
        onContentChange={this.onAdminEditorChange}
      />
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    isNewEditorEnabled: !!state.default.features.unstable__admin_editor,
  };
};

export default connect<any, any, _, _, _, _>(mapStateToProps)(EditorBehindFeatureFlag);
