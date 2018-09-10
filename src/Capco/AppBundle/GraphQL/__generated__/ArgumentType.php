<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

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
final class ArgumentType extends ObjectType implements GeneratedTypeInterface
{

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'Argument',
            'description' => 'An argument',
            'fields' => function () use ($globalVariable) {
                return [
                'id' => [
                    'type' => Type::nonNull(Type::id()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The ID of an object',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'kind' => [
                    'type' => Type::nonNull(Type::string()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The kind of contribution (argument).',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'related' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('Contribution'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Return the related contribution if the contribution is related to another.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'show_url' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('URI')),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["argument_url", array(0 => $value)]);
                    },
                    'description' => 'The HTTP show url for this contribution.',
                    'deprecationReason' => 'Use url instead of show_url',
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'url' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('URI')),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["argument_url", array(0 => $value)]);
                    },
                    'description' => 'Url of the contribution',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'viewerHasReport' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $value->userHasReport(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable));
                    },
                    'description' => 'Does the viewer already submitted a report ?',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'author' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('User')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The author of the contribution.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'trashedStatus' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('TrashableStatus'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The status.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'published' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $value->isPublished();
                    },
                    'description' => '`true` if the object is published.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'publishableUntil' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DateTime'),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $value->getPublishableUntil();
                    },
                    'description' => 'Identifies when the entity can no more be published.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'publishedAt' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DateTime'),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $value->getPublishedAt();
                    },
                    'description' => 'Identifies when the entity was published at.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'notPublishedReason' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('NotPublishedReason'),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Publishable\\PublishableNotPublishedReasonResolver", array(0 => $value)]);
                    },
                    'description' => 'Reason that the entity is not published.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'show_url' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('URI')),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["argument_url", array(0 => $value)]);
                    },
                    'description' => 'The HTTP show url for this contribution.',
                    'deprecationReason' => 'Use url instead of show_url',
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'url' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('URI')),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["argument_url", array(0 => $value)]);
                    },
                    'description' => 'Url of the contribution',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'author' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('User')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The author of the contribution.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'viewerHasReport' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $value->userHasReport(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable));
                    },
                    'description' => 'Does the viewer already submitted a report ?',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'createdAt' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DateTime')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Identifies the date and time when the object was created.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'type' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ArgumentValue')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The type.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'votes' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ArgumentVoteConnection')),
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
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Argument\\ArgumentVotesResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'body' => [
                    'type' => Type::nonNull(Type::string()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The content of the argument.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'viewerHasVote' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Argument\\ArgumentViewerHasVoteResolver", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'viewerVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ArgumentVote'),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Argument\\ArgumentViewerVoteResolver", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'contribuable' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $value->canContribute();
                    },
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
                return [$globalVariable->get('typeResolver')->resolve('Node'), $globalVariable->get('typeResolver')->resolve('Publishable'), $globalVariable->get('typeResolver')->resolve('Contribution'), $globalVariable->get('typeResolver')->resolve('Reportable'), $globalVariable->get('typeResolver')->resolve('Trashable'), $globalVariable->get('typeResolver')->resolve('ContributionWithAuthor'), $globalVariable->get('typeResolver')->resolve('EditableContribution')];
            },
            'isTypeOf' => null,
            'resolveField' => null,
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
