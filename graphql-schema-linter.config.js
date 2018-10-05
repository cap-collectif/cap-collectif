module.exports = {
  rules: [
    'relay-connection-types-spec',
    'relay-connection-arguments-spec',
    'relay-page-info-spec',
    'types-are-capitalized',
    'deprecations-have-a-reason',
    // TODO enable this https://github.com/cap-collectif/platform/issues/6103
    // 'enum-values-sorted-alphabetically',
    // TODO enable this https://github.com/cap-collectif/platform/issues/6102
    // 'enum-values-all-caps',
    // TODO enable this when `show_url` is removed
    //'fields-are-camel-cased',
    // TODO enable this when `current_password` is removed
    // 'input-object-values-are-camel-cased',
    // TODO enable all rules https://github.com/cap-collectif/platform/issues/6104
    // 'enum-values-have-descriptions',
    // 'fields-have-descriptions',
    // 'input-object-values-have-descriptions',
    // 'types-have-descriptions',
  ],
};
