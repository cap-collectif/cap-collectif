<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

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
    const NAME = 'CommentOrderField';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'CommentOrderField',
            'values' => [
                'PUBLISHED_AT' => [
                    'name' => 'PUBLISHED_AT',
                    'value' => 'PUBLISHED_AT',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of comments by when they were published.',
                ],
                'UPDATED_AT' => [
                    'name' => 'UPDATED_AT',
                    'value' => 'UPDATED_AT',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of comments by when they were updated.',
                ],
                'POPULARITY' => [
                    'name' => 'POPULARITY',
                    'value' => 'POPULARITY',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of comments by there likes.',
                ],
            ],
            'description' => 'Ordering options for comments.',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
