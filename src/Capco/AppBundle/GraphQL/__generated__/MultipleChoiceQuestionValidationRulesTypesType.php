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
final class MultipleChoiceQuestionValidationRulesTypesType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'MultipleChoiceQuestionValidationRulesTypes';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'MultipleChoiceQuestionValidationRulesTypes',
            'values' => [
                'MIN' => [
                    'name' => 'MIN',
                    'value' => 'min',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'EQUAL' => [
                    'name' => 'EQUAL',
                    'value' => 'equal',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'MAX' => [
                    'name' => 'MAX',
                    'value' => 'max',
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => 'Available types of validation rules',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
