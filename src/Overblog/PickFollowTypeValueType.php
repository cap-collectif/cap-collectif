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
final class PickFollowTypeValueType extends EnumType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'PickFollowTypeValue',
                'values' => [
                    'DEFAULT' => [
                        'name' => 'DEFAULT',
                        'value' => '1',
                        'deprecationReason' => null,
                        'description' => null,
                    ],
                    'DEFAULT_AND_COMMENTS' => [
                        'name' => 'DEFAULT_AND_COMMENTS',
                        'value' => '2',
                        'deprecationReason' => null,
                        'description' => null,
                    ],
                    'ALL' => [
                        'name' => 'ALL',
                        'value' => '3',
                        'deprecationReason' => null,
                        'description' => null,
                    ],
                ],
                'description' => '3 possible values',
            ];
        };
        $config = $configProcessor
            ->process(LazyConfig::create($configLoader, $globalVariables))
            ->load();
        parent::__construct($config);
    }
}
