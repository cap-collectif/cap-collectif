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
final class AddSourcePayloadType extends ObjectType implements GeneratedTypeInterface
{
    const NAME = 'AddSourcePayload';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'AddSourcePayload',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'source' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('Source'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The newly created source.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'sourceEdge' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('SourceEdge'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The edge from the sourceable\'s sources connection.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'userErrors' => [
                    'type' => Type::nonNull(Type::listOf(Type::nonNull($globalVariable->get('typeResolver')->resolve('UserError')))),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'An unsuccessful mutation will return one or more `UserError` objects.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'clientMutationId' => [
                    'type' => Type::string(),
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
