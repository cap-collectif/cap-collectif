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
final class ReportingOrderFieldType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'ReportingOrderField';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ReportingOrderField',
            'values' => [
                'CREATED_AT' => [
                    'name' => 'CREATED_AT',
                    'value' => 'CREATED_AT',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of reports by when they were created.',
                ],
            ],
            'description' => 'Properties by which report connections can be ordered',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
