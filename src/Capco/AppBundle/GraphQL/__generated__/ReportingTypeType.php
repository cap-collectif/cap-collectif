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
final class ReportingTypeType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'ReportingType';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ReportingType',
            'values' => [
                'ERROR' => [
                    'name' => 'ERROR',
                    'value' => 3,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'OFF' => [
                    'name' => 'OFF',
                    'value' => 1,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'OFF_TOPIC' => [
                    'name' => 'OFF_TOPIC',
                    'value' => 4,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'SEX' => [
                    'name' => 'SEX',
                    'value' => 0,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'SPAM' => [
                    'name' => 'SPAM',
                    'value' => 2,
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => 'Type of reporting',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
