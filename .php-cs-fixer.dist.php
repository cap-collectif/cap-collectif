<?php

use PhpCsFixer\Config;
use PhpCsFixer\Finder;

if (!file_exists(__DIR__ . '/src')) {
    exit(0);
}

$finder = Finder::create()
    ->in([
        'src',
        'spec',
        'tests',
        '.castor',
        'scripts/qa',
    ])
    ->exclude('Capco/AppBundle/GraphQL/__generated__')
;

$config = new Config();

return $config
    ->setFinder($finder)
    ->setRiskyAllowed(true)
    ->setUsingCache(true)
    ->setRules(
        [
            '@Symfony' => true,
            '@PSR2' => true,
            '@PhpCsFixer' => true,
            'php_unit_test_class_requires_covers' => false,
            'method_argument_space' => ['on_multiline' => 'ensure_fully_multiline'],
            'no_extra_blank_lines' => ['tokens' => ['break', 'continue', 'extra', 'return', 'throw', 'use', 'parenthesis_brace_block', 'square_brace_block', 'curly_brace_block']],
            'no_unreachable_default_argument_value' => false,
            'no_unset_on_property' => true,
            'strict_comparison' => false,
            'strict_param' => false,
            'nullable_type_declaration_for_default_null_value' => ['use_nullable_type_declaration' => true],
            'concat_space' => ['spacing' => 'one'],
        ]
    )
;
