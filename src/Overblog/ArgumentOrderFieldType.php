<?php
namespace Overblog\GraphQLBundle\__DEFINITIONS__;

use GraphQL\Type\Definition\EnumType;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class ArgumentOrderFieldType extends EnumType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'ArgumentOrderField',
                'values' => [
                    'CREATED_AT' => [
                        'name' => 'CREATED_AT',
                        'value' => 'CREATED_AT',
                        'deprecationReason' => null,
                        'description' =>
                            'Allows ordering a list of arguments by when they were created.',
                    ],
                    'VOTES' => [
                        'name' => 'VOTES',
                        'value' => 'VOTES',
                        'deprecationReason' => null,
                        'description' =>
                            'Allows ordering a list of arguments by the number of votes it have.',
                    ],
                ],
                'description' => 'Properties by which argument connections can be ordered',
            ];
        };
        $config = $configProcessor
            ->process(LazyConfig::create($configLoader, $globalVariables))
            ->load();
        parent::__construct($config);
    }
}
