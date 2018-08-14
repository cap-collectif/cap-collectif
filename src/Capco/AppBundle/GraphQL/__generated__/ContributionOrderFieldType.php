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
final class ContributionOrderFieldType extends EnumType implements GeneratedTypeInterface
{

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ContributionOrderField',
            'values' => [
                'POSITION' => [
                    'name' => 'POSITION',
                    'value' => 'POSITION',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'RANDOM' => [
                    'name' => 'RANDOM',
                    'value' => 'RANDOM',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'PUBLISHED_AT' => [
                    'name' => 'PUBLISHED_AT',
                    'value' => 'PUBLISHED_AT',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'POPULAR' => [
                    'name' => 'POPULAR',
                    'value' => 'POPULAR',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'COMMENT_COUNT' => [
                    'name' => 'COMMENT_COUNT',
                    'value' => 'COMMENT_COUNT',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'VOTE_COUNT' => [
                    'name' => 'VOTE_COUNT',
                    'value' => 'VOTE_COUNT',
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => 'Ordering options for contributions connections.',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
