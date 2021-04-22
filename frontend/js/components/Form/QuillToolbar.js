// @flow
import * as React from 'react';
import { useMenuBarState, MenuItem, MenuGroup, MenuBar } from 'reakit/Menu';
import { useIntl } from 'react-intl';
import VisuallyHidden from '~ds/VisuallyHidden/VisuallyHidden';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';

type Props = {|
  +onFocus: () => void,
|};

const QuillToolbar = ({ onFocus }: Props): React.Node => {
  const intl = useIntl();
  const menu = useMenuBarState({ baseId: 'quill-toolbar', orientation: 'horizontal' });

  return (
    <MenuBar {...menu} as={Flex} direction="row">
      <VisuallyHidden>
        <MenuItem {...menu} as={Button} onClick={onFocus} visible={false}>
          {intl.formatMessage({ id: 'aria-editor-skip-toolbar' })}
        </MenuItem>
      </VisuallyHidden>

      <MenuItem
        {...menu}
        as="select"
        className="ql-formats ql-size"
        aria-label={intl.formatMessage({ id: 'global.fontsize' })}>
        <option value="small">{intl.formatMessage({ id: 'editor.size.small' })}</option>
        <option value="normal" selected>
          {intl.formatMessage({ id: 'editor.size.normal' })}
        </option>
        <option value="large">{intl.formatMessage({ id: 'editor.size.large' })}</option>
      </MenuItem>

      <MenuGroup
        {...menu}
        className="ql-formats ql-editor-button"
        as={Flex}
        direction="row"
        aria-label={intl.formatMessage({ id: 'aria-editor-tools-style' })}>
        <MenuItem
          {...menu}
          as="button"
          type="button"
          aria-label={intl.formatMessage({ id: 'global.bold' })}
          className="ql-bold ql-editor-button"
        />
        <MenuItem
          {...menu}
          as="button"
          type="button"
          aria-label={intl.formatMessage({ id: 'global.italic' })}
          className="ql-italic ql-editor-button"
        />
        <MenuItem
          {...menu}
          as="button"
          type="button"
          aria-label={intl.formatMessage({ id: 'global.underline' })}
          className="ql-underline ql-editor-button"
        />
        <MenuItem
          {...menu}
          as="button"
          type="button"
          aria-label={intl.formatMessage({ id: 'global.strike' })}
          className="ql-strike ql-editor-button"
        />
      </MenuGroup>

      <MenuGroup
        {...menu}
        className="ql-formats"
        as={Flex}
        direction="row"
        aria-label={intl.formatMessage({ id: 'aria-editor-tools-alignment' })}>
        <MenuItem
          {...menu}
          as="button"
          type="button"
          className="ql-list ql-editor-button"
          value="ordered"
          aria-label={intl.formatMessage({ id: 'editor.list' })}
        />
        <MenuItem
          {...menu}
          as="button"
          type="button"
          className="ql-list ql-editor-button"
          value="bullet"
          aria-label={intl.formatMessage({ id: 'global.list' })}
        />
        <MenuItem
          {...menu}
          as="button"
          type="button"
          className="ql-indent ql-editor-button"
          value="-1"
          aria-label={intl.formatMessage({ id: 'global.delete.indent' })}
        />
        <MenuItem
          {...menu}
          as="button"
          type="button"
          className="ql-indent ql-editor-button"
          value="+1"
          aria-label={intl.formatMessage({ id: 'global.indent' })}
        />
        <MenuItem
          {...menu}
          as="select"
          aria-label={intl.formatMessage({ id: 'editor.align.title' })}
          className="ql-align">
          <option aria-label={intl.formatMessage({ id: 'editor.align.left' })} selected />
          <option value="center" aria-label={intl.formatMessage({ id: 'editor.align.center' })} />
          <option value="right" aria-label={intl.formatMessage({ id: 'editor.align.right' })} />
          <option value="justify" aria-label={intl.formatMessage({ id: 'editor.align.justify' })} />
        </MenuItem>
      </MenuGroup>

      <MenuGroup
        {...menu}
        className="ql-formats"
        as={Flex}
        direction="row"
        aria-label={intl.formatMessage({ id: 'aria-editor-tools-insertion' })}>
        <MenuItem
          {...menu}
          as="button"
          type="button"
          aria-label={intl.formatMessage({ id: 'global.link' })}
          className="ql-link ql-editor-button"
        />
        <MenuItem
          {...menu}
          as="button"
          type="button"
          aria-label={intl.formatMessage({ id: 'global.image' })}
          className="ql-image ql-editor-button"
        />
        <MenuItem
          {...menu}
          as="button"
          type="button"
          aria-label={intl.formatMessage({ id: 'global.video' })}
          className="ql-video ql-editor-button"
        />
      </MenuGroup>
    </MenuBar>
  );
};

export default QuillToolbar;
