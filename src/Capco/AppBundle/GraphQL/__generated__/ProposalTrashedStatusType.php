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
final class ProposalTrashedStatusType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'ProposalTrashedStatus';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ProposalTrashedStatus',
            'values' => [
                'TRASHED' => [
                    'name' => 'TRASHED',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProposalTrashedStatus::TRASHED"),
                    'deprecationReason' => null,
                    'description' => '`TRASHED` status to include the trashed proposal.',
                ],
                'NOT_TRASHED' => [
                    'name' => 'NOT_TRASHED',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProposalTrashedStatus::NOT_TRASHED"),
                    'deprecationReason' => null,
                    'description' => '`NOT_TRASHED` status to inclide the non trashed proposal.',
                ],
            ],
            'description' => 'Possible trashed status for a `Proposal`.',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
