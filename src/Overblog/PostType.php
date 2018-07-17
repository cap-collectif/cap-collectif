<?php
namespace Overblog\GraphQLBundle\__DEFINITIONS__;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class PostType extends ObjectType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'Post',
                'description' => null,
                'fields' =>
                    function () use ($globalVariable) {
                        return [
                            'id' => [
                                'type' => Type::nonNull(Type::string()),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'title' => [
                                'type' => Type::nonNull(Type::string()),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'relatedContent' => [
                                'type' =>
                                    Type::nonNull(
                                        Type::listOf(
                                            Type::nonNull(
                                                $globalVariable
                                                    ->get('typeResolver')
                                                    ->resolve('PostRelatedContent')
                                            )
                                        )
                                    ),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve([
                                                "Capco\\AppBundle\\GraphQL\\Resolver\\Post\\PostRelatedContentResolver",
                                                array(0 => $value),
                                            ]);
                                    },
                                'description' => null,
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
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'updatedAt' => [
                                'type' =>
                                    Type::nonNull(
                                        $globalVariable->get('typeResolver')->resolve('DateTime')
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
                            'publishedAt' => [
                                'type' => $globalVariable->get('typeResolver')->resolve('DateTime'),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'authors' => [
                                'type' =>
                                    Type::nonNull(
                                        Type::listOf(
                                            Type::nonNull(
                                                $globalVariable
                                                    ->get('typeResolver')
                                                    ->resolve('User')
                                            )
                                        )
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
                            'publicationStatus' => [
                                'type' =>
                                    Type::nonNull(
                                        $globalVariable
                                            ->get('typeResolver')
                                            ->resolve('PostPublicationStatus')
                                    ),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve([
                                                "Capco\\AppBundle\\GraphQL\\Resolver\\Post\\PostPublicationStatusResolver",
                                                array(0 => $value),
                                            ]);
                                    },
                                'description' => 'The publication status for this post.',
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'commentable' => [
                                'type' => Type::nonNull(Type::boolean()),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $value->getIsCommentable();
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'displayedOnBlog' => [
                                'type' => Type::nonNull(Type::boolean()),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'comments' => [
                                'type' =>
                                    Type::nonNull(
                                        $globalVariable
                                            ->get('typeResolver')
                                            ->resolve('CommentConnection')
                                    ),
                                'args' => [
                                    [
                                        'name' => 'after',
                                        'type' => Type::string(),
                                        'description' => null,
                                    ],
                                    [
                                        'name' => 'first',
                                        'type' => Type::int(),
                                        'description' => null,
                                        'defaultValue' => 30,
                                    ],
                                    [
                                        'name' => 'before',
                                        'type' => Type::string(),
                                        'description' => null,
                                    ],
                                    [
                                        'name' => 'last',
                                        'type' => Type::int(),
                                        'description' => null,
                                    ],
                                    [
                                        'name' => 'orderBy',
                                        'type' =>
                                            $globalVariable
                                                ->get('typeResolver')
                                                ->resolve('CommentOrder'),
                                        'description' => null,
                                        'defaultValue' => [
                                            'field' => 'CREATED_AT',
                                            'direction' => 'DESC',
                                        ],
                                    ],
                                ],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve([
                                                "Capco\\AppBundle\\GraphQL\\Resolver\\Post\\PostCommentsResolver",
                                                array(0 => $value, 1 => $args),
                                            ]);
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'abstract' => [
                                'type' => Type::nonNull(Type::string()),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve(["post_abstract", array(0 => $value)]);
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'url' => [
                                'type' =>
                                    Type::nonNull(
                                        $globalVariable->get('typeResolver')->resolve('URI')
                                    ),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve([
                                                "Capco\\AppBundle\\GraphQL\\Resolver\\Post\\PostUrlResolver",
                                                array(0 => $value),
                                            ]);
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'media' => [
                                'type' => $globalVariable->get('typeResolver')->resolve('Media'),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'themes' => [
                                'type' =>
                                    Type::nonNull(
                                        Type::listOf(
                                            Type::nonNull(
                                                $globalVariable
                                                    ->get('typeResolver')
                                                    ->resolve('Theme')
                                            )
                                        )
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
                            'body' => [
                                'type' => Type::nonNull(Type::string()),
                                'args' => [],
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
                'interfaces' =>
                    function () use ($globalVariable) {
                        return [];
                    },
                'isTypeOf' => null,
                'resolveField' => null,
            ];
        };
        $config = $configProcessor
            ->process(LazyConfig::create($configLoader, $globalVariables))
            ->load();
        parent::__construct($config);
    }
}
