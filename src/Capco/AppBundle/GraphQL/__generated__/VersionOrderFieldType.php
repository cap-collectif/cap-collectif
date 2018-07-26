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
final class VersionOrderFieldType extends EnumType implements GeneratedTypeInterface
{

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'VersionOrderField',
            'values' => [
                'CREATED_AT' => [
                    'name' => 'CREATED_AT',
                    'value' => 'CREATED_AT',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of versions by when they were created.',
                ],
                'VOTES' => [
                    'name' => 'VOTES',
                    'value' => 'VOTES',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of versions by the number of votes it have.',
                ],
            ],
            'description' => 'Properties by which version connections can be ordered',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
