<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class LogicJumpType extends ObjectType implements GeneratedTypeInterface
{
    const NAME = 'LogicJump';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'LogicJump',
            'description' => 'A logic jump in a question.',
            'fields' => function () use ($globalVariable) {
                return [
                'id' => [
                    'type' => Type::id(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'always' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'If true, the logic jump will always be triggered, ',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'origin' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('Question')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Return the question that trigger this logic jump.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'destination' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('Question')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Return the question which this logic jump leads to.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'conditions' => [
                    'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('LogicJumpCondition')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Return the necessited conditions that needs to be fullfiled to trigger this logic jump.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
            ];
            },
            'interfaces' => function () use ($globalVariable) {
                return [];
            },
            'isTypeOf' => null,
            'resolveField' => null,
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
