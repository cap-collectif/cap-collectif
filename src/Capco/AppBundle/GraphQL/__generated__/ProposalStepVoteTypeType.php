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
final class ProposalStepVoteTypeType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'ProposalStepVoteType';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ProposalStepVoteType',
            'values' => [
                'DISABLED' => [
                    'name' => 'DISABLED',
                    'value' => 0,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'SIMPLE' => [
                    'name' => 'SIMPLE',
                    'value' => 1,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'BUDGET' => [
                    'name' => 'BUDGET',
                    'value' => 2,
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => 'Type of vote.',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
