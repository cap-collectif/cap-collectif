<?php
namespace Overblog\GraphQLBundle\__DEFINITIONS__;

use GraphQL\Type\Definition\EnumType;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class CommentOrderFieldType extends EnumType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'CommentOrderField',
                'values' => [
                    'CREATED_AT' => [
                        'name' => 'CREATED_AT',
                        'value' => 'CREATED_AT',
                        'deprecationReason' => null,
                        'description' => null,
                    ],
                    'UPDATED_AT' => [
                        'name' => 'UPDATED_AT',
                        'value' => 'UPDATED_AT',
                        'deprecationReason' => null,
                        'description' => null,
                    ],
                    'POPULARITY' => [
                        'name' => 'POPULARITY',
                        'value' => 'POPULARITY',
                        'deprecationReason' => null,
                        'description' => null,
                    ],
                ],
                'description' => 'Ordering options for comments.',
            ];
        };
        $config = $configProcessor
            ->process(LazyConfig::create($configLoader, $globalVariables))
            ->load();
        parent::__construct($config);
    }
}
