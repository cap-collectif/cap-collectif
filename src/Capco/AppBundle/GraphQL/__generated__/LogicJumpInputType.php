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
final class LogicJumpInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'LogicJumpInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'LogicJumpInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'id' => [
                    'type' => Type::id(),
                    'description' => null,
                ],
                'always' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'origin' => [
                    'type' => Type::nonNull(Type::int()),
                    'description' => 'The id of the question where the logic jump start',
                ],
                'destination' => [
                    'type' => Type::nonNull(Type::int()),
                    'description' => 'The id of the question where the logic jump end if the conditions are fulfilled',
                ],
                'conditions' => [
                    'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('LogicJumpConditionInput')),
                    'description' => 'A collection of conditions that you have to fulfill for displaying the destination question',
                ],
            ];
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
