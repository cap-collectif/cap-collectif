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
final class ProposalVoteOrderFieldType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'ProposalVoteOrderField';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ProposalVoteOrderField',
            'values' => [
                'PUBLISHED_AT' => [
                    'name' => 'PUBLISHED_AT',
                    'value' => 'PUBLISHED_AT',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of vote by when they were published.',
                ],
            ],
            'description' => 'Ordering options for proposals votes connections.',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
