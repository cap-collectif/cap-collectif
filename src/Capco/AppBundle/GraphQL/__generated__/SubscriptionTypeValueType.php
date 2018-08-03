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
final class SubscriptionTypeValueType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'SubscriptionTypeValue';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'SubscriptionTypeValue',
            'values' => [
                'ALL' => [
                    'name' => 'ALL',
                    'value' => 'ALL',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'ESSENTIAL' => [
                    'name' => 'ESSENTIAL',
                    'value' => 'ESSENTIAL',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'MINIMAL' => [
                    'name' => 'MINIMAL',
                    'value' => 'MINIMAL',
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => '3 possible values for a subscription.',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
