import { Box, Flex } from '@cap-collectif/ui'
import type { DiffEditorProps, EditorProps, Monaco } from '@monaco-editor/react'
import dynamic from 'next/dynamic'
import { FC, useState } from 'react'
import { useIntl } from 'react-intl'

const MonacoEditor = dynamic<EditorProps>(() => import('@monaco-editor/react').then(module => module.default), {
  ssr: false,
  loading: () => <EditorLoading height="420px" messageId="admin.custom-code.loading-editor" />,
})

const MonacoDiffEditor = dynamic<DiffEditorProps>(
  () => import('@monaco-editor/react').then(module => module.DiffEditor),
  {
    ssr: false,
    loading: () => <EditorLoading height="520px" messageId="admin.custom-code.loading-diff" />,
  },
)

const configureCustomCodeEditor = (monaco: Monaco) => {
  const languages = monaco.languages as typeof monaco.languages & {
    css?: {
      cssDefaults?: {
        setDiagnosticsOptions: (options: Record<string, unknown>) => void
      }
    }
    html?: {
      htmlDefaults?: {
        setModeConfiguration: (options: Record<string, unknown>) => void
        setOptions: (options: Record<string, unknown>) => void
      }
    }
    typescript?: {
      javascriptDefaults?: {
        setCompilerOptions: (options: Record<string, unknown>) => void
        setDiagnosticsOptions: (options: Record<string, unknown>) => void
        setEagerModelSync: (value: boolean) => void
      }
    }
  }

  languages.html?.htmlDefaults?.setOptions({
    format: {
      contentUnformatted: 'script,style,noscript',
      indentInnerHtml: true,
      preserveNewLines: true,
      wrapLineLength: 0,
    },
  })
  languages.html?.htmlDefaults?.setModeConfiguration({
    completionItems: true,
    diagnostics: true,
    documentHighlights: true,
    documentLinks: true,
    documentSymbols: true,
    foldingRanges: true,
    hovers: true,
    selectionRanges: true,
  })
  languages.css?.cssDefaults?.setDiagnosticsOptions({
    validate: true,
    lint: {
      compatibleVendorPrefixes: 'warning',
      duplicateProperties: 'warning',
      emptyRules: 'warning',
      unknownAtRules: 'warning',
      unknownProperties: 'warning',
    },
  })
  languages.typescript?.javascriptDefaults?.setEagerModelSync(true)
  languages.typescript?.javascriptDefaults?.setCompilerOptions({
    allowNonTsExtensions: true,
    allowJs: true,
    checkJs: true,
    noEmit: true,
    target: 7,
  })
  languages.typescript?.javascriptDefaults?.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  })
}

const CUSTOM_CODE_EDITOR_OPTIONS: EditorProps['options'] = {
  acceptSuggestionOnCommitCharacter: false,
  acceptSuggestionOnEnter: 'off',
  autoClosingBrackets: 'always',
  autoClosingDelete: 'always',
  autoClosingOvertype: 'always',
  autoClosingQuotes: 'always',
  automaticLayout: true,
  autoSurround: 'languageDefined',
  bracketPairColorization: { enabled: true },
  colorDecorators: true,
  contextmenu: true,
  folding: true,
  formatOnPaste: true,
  formatOnType: false,
  hover: {
    delay: 250,
    enabled: true,
    sticky: true,
  },
  links: true,
  matchBrackets: 'always',
  minimap: { enabled: false },
  parameterHints: {
    enabled: true,
  },
  quickSuggestions: {
    comments: false,
    other: true,
    strings: true,
  },
  quickSuggestionsDelay: 80,
  scrollBeyondLastColumn: 8,
  scrollBeyondLastLine: false,
  scrollbar: {
    horizontal: 'visible',
  },
  snippetSuggestions: 'none',
  suggest: {
    filterGraceful: true,
    localityBonus: true,
    preview: true,
    showClasses: true,
    showColors: true,
    showConstructors: true,
    showDeprecated: true,
    showEvents: true,
    showFields: true,
    showFiles: true,
    showFunctions: true,
    showIcons: true,
    showInlineDetails: true,
    showInterfaces: true,
    showKeywords: true,
    showMethods: true,
    showModules: true,
    showOperators: true,
    showProperties: true,
    showReferences: true,
    showSnippets: true,
    showStructs: true,
    showValues: true,
    showVariables: true,
    showWords: true,
    snippetsPreventQuickSuggestions: false,
  },
  suggestOnTriggerCharacters: true,
  tabSize: 2,
  tabCompletion: 'on',
  wordWrap: 'off',
  renderLineHighlight: 'line',
  padding: { top: 16, bottom: 16 },
}

const CUSTOM_CODE_EDITOR_CONTAINER_SX = {
  '.monaco-editor, .monaco-editor-background, .monaco-editor .margin': {
    borderRadius: '8px',
  },
  '.monaco-editor .view-line, .monaco-editor .view-lines': {
    whiteSpace: 'nowrap',
  },
} as const

const handleCustomCodeEditorMount = (editor: Parameters<NonNullable<EditorProps['onMount']>>[0]) => {
  editor.updateOptions({
    formatOnType: false,
    wordWrap: 'off',
    wrappingStrategy: 'simple',
    scrollbar: {
      horizontal: 'visible',
    },
  })
  window.requestAnimationFrame(() => editor.layout())
}

type CustomCodeEditorProps = {
  height: string
  value: string
  onChange: (value: string) => void
}

export const CustomCodeEditor: FC<CustomCodeEditorProps> = ({
  height,
  value,
  onChange,
}) => {
  const intl = useIntl()
  const [, forceEditorRefresh] = useState(0)

  return (
    <Box
      bg="gray.900"
      borderRadius="8px"
      width="100%"
      height={height}
      minHeight={height}
      overflow="hidden"
      sx={CUSTOM_CODE_EDITOR_CONTAINER_SX}
    >
      <MonacoEditor
        height={height}
        language="html"
        theme="vs-dark"
        value={value}
        onChange={nextValue => onChange(nextValue ?? '')}
        loading={null}
        beforeMount={configureCustomCodeEditor}
        onMount={editor => {
          handleCustomCodeEditorMount(editor)
          // Monaco can leave horizontal layout stale while typing long unwrapped lines.
          editor.onKeyDown(() => forceEditorRefresh(value => (value + 1) % 1000))
        }}
        options={CUSTOM_CODE_EDITOR_OPTIONS}
        defaultValue={intl.formatMessage({ id: 'admin.custom-code.empty-code-placeholder' })}
      />
    </Box>
  )
}

type DiffViewProps = {
  previousContent: string
  nextContent: string
}

export const DiffView: FC<DiffViewProps> = ({ previousContent, nextContent }) => {
  return (
    <Box
      bg="gray.900"
      borderRadius="8px"
      overflow="auto"
      height="520px"
      sx={{
        '.monaco-diff-editor, .monaco-editor, .monaco-editor-background, .monaco-editor .margin': {
          borderRadius: '8px',
        },
      }}
    >
      <MonacoDiffEditor
        height="520px"
        language="html"
        theme="vs-dark"
        original={previousContent}
        modified={nextContent}
        loading={null}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          readOnly: true,
          renderSideBySide: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
        }}
      />
    </Box>
  )
}

type ReadOnlyCodeViewProps = {
  content: string
}

export const ReadOnlyCodeView: FC<ReadOnlyCodeViewProps> = ({ content }) => (
  <Box
    bg="gray.900"
    borderRadius="8px"
    height="520px"
    overflow="hidden"
    sx={{
      '.monaco-editor, .monaco-editor-background, .monaco-editor .margin': {
        borderRadius: '8px',
      },
    }}
  >
    <MonacoEditor
      height="520px"
      language="html"
      theme="vs-dark"
      value={content}
      loading={null}
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        readOnly: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 16, bottom: 16 },
      }}
    />
  </Box>
)

type EditorLoadingProps = {
  height: string
  messageId: string
}

const EditorLoading: FC<EditorLoadingProps> = ({ height, messageId }) => {
  const intl = useIntl()

  return (
    <Flex align="center" justify="center" height={height} bg="gray.900" color="gray.100">
      {intl.formatMessage({ id: messageId })}
    </Flex>
  )
}
