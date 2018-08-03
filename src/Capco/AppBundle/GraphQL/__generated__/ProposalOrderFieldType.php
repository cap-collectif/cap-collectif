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
final class ProposalOrderFieldType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'ProposalOrderField';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ProposalOrderField',
            'values' => [
                'PUBLISHED_AT' => [
                    'name' => 'PUBLISHED_AT',
                    'value' => 'PUBLISHED_AT',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of proposals by when they were created.',
                ],
                'VOTES' => [
                    'name' => 'VOTES',
                    'value' => 'VOTES',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of proposals by the number of votes it have.',
                ],
                'COMMENTS' => [
                    'name' => 'COMMENTS',
                    'value' => 'COMMENTS',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of proposals by the number of comments it have.',
                ],
                'RANDOM' => [
                    'name' => 'RANDOM',
                    'value' => 'RANDOM',
                    'deprecationReason' => null,
                    'description' => 'Allows randomizing a list of proposals.',
                ],
                'COST' => [
                    'name' => 'COST',
                    'value' => 'COST',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of proposals by the cost it have been estimated.',
                ],
            ],
            'description' => 'Properties by which proposal connections can be ordered',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
