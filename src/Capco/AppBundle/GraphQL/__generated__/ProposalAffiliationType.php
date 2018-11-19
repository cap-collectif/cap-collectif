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
final class ProposalAffiliationType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'ProposalAffiliation';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ProposalAffiliation',
            'values' => [
                'OWNER' => [
                    'name' => 'OWNER',
                    'value' => 'OWNER',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'EVALUER' => [
                    'name' => 'EVALUER',
                    'value' => 'EVALUER',
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => 'The affiliation of a user to a proposal',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
