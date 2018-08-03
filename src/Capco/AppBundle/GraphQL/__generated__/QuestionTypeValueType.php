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
final class QuestionTypeValueType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'QuestionTypeValue';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'QuestionTypeValue',
            'values' => [
                'text' => [
                    'name' => 'text',
                    'value' => 0,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'textarea' => [
                    'name' => 'textarea',
                    'value' => 1,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'editor' => [
                    'name' => 'editor',
                    'value' => 2,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'radio' => [
                    'name' => 'radio',
                    'value' => 3,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'select' => [
                    'name' => 'select',
                    'value' => 4,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'checkbox' => [
                    'name' => 'checkbox',
                    'value' => 5,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'ranking' => [
                    'name' => 'ranking',
                    'value' => 6,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'medias' => [
                    'name' => 'medias',
                    'value' => 7,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'button' => [
                    'name' => 'button',
                    'value' => 8,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'number' => [
                    'name' => 'number',
                    'value' => 9,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'section' => [
                    'name' => 'section',
                    'value' => 10,
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => 'Value of type of question',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
