### How to write localizable components

Just import the appropriate [component](https://github.com/yahoo/react-intl/wiki#the-react-intl-module) from `react-intl`

- For localizable text use
[`<FormattedMessage>`](https://github.com/yahoo/react-intl/wiki/Components#formattedmessage).

- For date and time:
[`<FormattedDate>`](https://github.com/yahoo/react-intl/wiki/Components#formatteddate)
[`<FormattedTime>`](https://github.com/yahoo/react-intl/wiki/Components#formattedtime)
[`<FormattedRelative>`](https://github.com/yahoo/react-intl/wiki/Components#formattedrelative)

- For numbers and currencies:
[`<FormattedNumber>`](https://github.com/yahoo/react-intl/wiki/Components#formattednumber)
[`<FormattedPlural>`](https://github.com/yahoo/react-intl/wiki/Components#formattedplural)

- If possible, do not use `<FormattedHTMLMessage>`, see how to use *Rich Text Formatting* with
[`<FormattedMessage>`](https://github.com/yahoo/react-intl/wiki/Components#formattedmessage)

- When you need an imperative formatting API, use the [`injectIntl`](https://github.com/yahoo/react-intl/wiki/API#injectintl) High-Order Component.
