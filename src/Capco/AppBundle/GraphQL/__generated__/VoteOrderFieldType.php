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
final class VoteOrderFieldType extends EnumType implements GeneratedTypeInterface
{

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'VoteOrderField',
            'values' => [
                'CREATED_AT' => [
                    'name' => 'CREATED_AT',
                    'value' => 'CREATED_AT',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'POSITION' => [
                    'name' => 'POSITION',
                    'value' => 'POSITION',
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => 'Ordering options for votes.',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
