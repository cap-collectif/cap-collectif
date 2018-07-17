<?php
namespace Overblog\GraphQLBundle\__DEFINITIONS__;

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
final class YesNoPairedVoteType extends InterfaceType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'YesNoPairedVote',
                'description' => null,
                'fields' =>
                    function () use ($globalVariable) {
                        return [
                            'id' => [
                                'type' => Type::nonNull(Type::id()),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'author' => [
                                'type' => $globalVariable->get('typeResolver')->resolve('User'),
                                'args' => [],
                                'resolve' => null,
                                'description' => 'The author of the contribution.',
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'value' => [
                                'type' =>
                                    Type::nonNull(
                                        $globalVariable
                                            ->get('typeResolver')
                                            ->resolve('YesNoPairedVoteValue')
                                    ),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'expired' => [
                                'type' => Type::nonNull(Type::boolean()),
                                'args' => [],
                                'resolve' => null,
                                'description' =>
                                    'If vote is expired, it exists but doesn\'t count.',
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'createdAt' => [
                                'type' =>
                                    Type::nonNull(
                                        $globalVariable->get('typeResolver')->resolve('DateTime')
                                    ),
                                'args' => [],
                                'resolve' => null,
                                'description' => 'Date of vote.',
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                        ];
                    },
                'resolveType' =>
                    function ($value, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable
                            ->get('resolverResolver')
                            ->resolve(["contribution_type", array(0 => $value)]);
                    },
            ];
        };
        $config = $configProcessor
            ->process(LazyConfig::create($configLoader, $globalVariables))
            ->load();
        parent::__construct($config);
    }
}
