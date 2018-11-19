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
final class GenderValueType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'GenderValue';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'GenderValue',
            'values' => [
                'MALE' => [
                    'name' => 'MALE',
                    'value' => 'm',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'FEMALE' => [
                    'name' => 'FEMALE',
                    'value' => 'f',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'OTHER' => [
                    'name' => 'OTHER',
                    'value' => 'o',
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => '3 possible values',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
