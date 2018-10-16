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
final class EventTimeType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'EventTime';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'EventTime',
            'values' => [
                'PASSED' => [
                    'name' => 'PASSED',
                    'value' => 'PASSED',
                    'deprecationReason' => null,
                    'description' => 'Allows finding a list of PASSED event',
                ],
                'FUTURE' => [
                    'name' => 'FUTURE',
                    'value' => 'FUTURE',
                    'deprecationReason' => null,
                    'description' => 'Allows finding a list of FUTURE event',
                ],
            ],
            'description' => 'Properties by which events can be research',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
