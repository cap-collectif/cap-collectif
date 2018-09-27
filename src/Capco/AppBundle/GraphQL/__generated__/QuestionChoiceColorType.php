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
final class QuestionChoiceColorType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'QuestionChoiceColor';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'QuestionChoiceColor',
            'values' => [
                'PRIMARY' => [
                    'name' => 'PRIMARY',
                    'value' => '#fffff',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'SUCCESS' => [
                    'name' => 'SUCCESS',
                    'value' => '#5cb85c',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'INFO' => [
                    'name' => 'INFO',
                    'value' => '#5bc0de',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'WARNING' => [
                    'name' => 'WARNING',
                    'value' => '#f0ad4e',
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'DANGER' => [
                    'name' => 'DANGER',
                    'value' => '#d9534f',
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => 'Available colors for a question choice',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
