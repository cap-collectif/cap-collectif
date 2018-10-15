<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\InterfaceType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class LogicJumpConditionType extends InterfaceType implements GeneratedTypeInterface
{
    const NAME = 'LogicJumpCondition';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'LogicJumpCondition',
            'description' => 'A particular condition in a logic jump.',
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
                'operator' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('LogicJumpConditionOperator')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Return the operator for this condition.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'question' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('Question')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Return the question which is going to be tested against the condition.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
            ];
            },
            'resolveType' => function ($value, $context, ResolveInfo $info) use ($globalVariable) {
                return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\LogicJumpCondition\\LogicJumpConditionTypeResolver", array(0 => $value)]);
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
