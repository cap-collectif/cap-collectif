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
                    'description' => null,
                ],
                'destination' => [
                    'type' => Type::nonNull(Type::int()),
                    'description' => null,
                ],
                'conditions' => [
                    'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('LogicJumpConditionInput')),
                    'description' => null,
                ],
            ];
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
