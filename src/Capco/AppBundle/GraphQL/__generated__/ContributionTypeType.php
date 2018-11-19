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
final class ContributionTypeType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'ContributionType';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ContributionType',
            'values' => [
                'OPINION' => [
                    'name' => 'OPINION',
                    'value' => 'OPINION',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'OPINIONVERSION' => [
                    'name' => 'OPINIONVERSION',
                    'value' => 'OPINIONVERSION',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'COMMENT' => [
                    'name' => 'COMMENT',
                    'value' => 'COMMENT',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'ARGUMENT' => [
                    'name' => 'ARGUMENT',
                    'value' => 'ARGUMENT',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'SOURCE' => [
                    'name' => 'SOURCE',
                    'value' => 'SOURCE',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'PROPOSAL' => [
                    'name' => 'PROPOSAL',
                    'value' => 'PROPOSAL',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'REPLY' => [
                    'name' => 'REPLY',
                    'value' => 'REPLY',
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => 'Different contribution type',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
