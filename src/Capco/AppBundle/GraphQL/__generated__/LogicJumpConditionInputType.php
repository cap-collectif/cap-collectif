<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class LogicJumpConditionInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'LogicJumpConditionInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'LogicJumpConditionInput',
            'description' => 'A particular condition in a logic jump.',
            'fields' => function () use ($globalVariable) {
                return [
                'id' => [
                    'type' => Type::id(),
                    'description' => null,
                ],
                'operator' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('LogicJumpConditionOperator')),
                    'description' => 'The operator used to check the condition',
                ],
                'question' => [
                    'type' => Type::nonNull(Type::int()),
                    'description' => 'The id of the question you want to have a condition',
                ],
                'value' => [
                    'type' => Type::string(),
                    'description' => 'The answer the selected question should have to trigger the condition',
                ],
            ];
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
