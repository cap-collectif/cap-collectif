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
final class VersionType extends ObjectType implements GeneratedTypeInterface
{

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'Version',
            'description' => 'A version of contribution',
            'fields' => function () use ($globalVariable) {
                return [
                'trashed' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'True if the contribution is trashed.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'trashedAt' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["proposition_trashedAt", array(0 => $value)]);
                    },
                    'description' => 'The moment the moderator trashed the contribution.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'trashedReason' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The reason the moderator trashed the contribution.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'id' => [
                    'type' => Type::nonNull(Type::id()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The id of the contribution.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
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
                'arguments' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ArgumentConnection')),
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
                        [
                            'name' => 'orderBy',
                            'type' => $globalVariable->get('typeResolver')->resolve('ArgumentOrder'),
                            'description' => null,
                            'defaultValue' => ['field' => 'CREATED_AT', 'direction' => 'DESC'],
                        ],
                        [
                            'name' => 'type',
                            'type' => $globalVariable->get('typeResolver')->resolve('ArgumentValue'),
                            'description' => 'If omitted, returns all arguments. If provided, returns the arguments of this particular type.',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Opinion\\OpinionArgumentsResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'The arguments related to the argumentable.',
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
                    'resolve' => function () use ($globalVariable) {
                        return 'version';
                    },
                    'description' => 'The kind of contribution.',
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
                    'resolve' => null,
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
                        return $globalVariable->get('resolverResolver')->resolve(["version_url", array(0 => $value)]);
                    },
                    'description' => 'The url of version.',
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
                'updatedAt' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DateTime'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Identifies the date and time when the object was last updated.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'sources' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('SourceConnection')),
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
                        [
                            'name' => 'orderBy',
                            'type' => $globalVariable->get('typeResolver')->resolve('SourceOrder'),
                            'description' => null,
                            'defaultValue' => ['field' => 'CREATED_AT', 'direction' => 'DESC'],
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Sourceable\\SourceableSourcesResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'The sources related to the sourceable.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'availableSourceCategories' => [
                    'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('SourceCategory')),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Sourceable\\SourceableAvailableCategoriesResolver", array()]);
                    },
                    'description' => 'The available sources categories of to the sourceable.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
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
                'expired' => [
                    'type' => Type::nonNull(Type::boolean()),
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
                'published' => [
                    'type' => Type::nonNull(Type::boolean()),
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
                'comment' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Explenation.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'argumentsCount' => [
                    'type' => Type::nonNull(Type::int()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Number of arguments.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'argumentsCountFor' => [
                    'type' => Type::nonNull(Type::int()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["proposition_argumentsCountFor", array(0 => $value)]);
                    },
                    'description' => 'Number of for arguments.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'argumentsCountAgainst' => [
                    'type' => Type::nonNull(Type::int()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["proposition_argumentsCountAgainst", array(0 => $value)]);
                    },
                    'description' => 'Number of against arguments.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'sourcesCount' => [
                    'type' => Type::nonNull(Type::int()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Number of sources.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'votes' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('VersionVoteConnection')),
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
                        [
                            'name' => 'orderBy',
                            'type' => $globalVariable->get('typeResolver')->resolve('ProposalVotesOrder'),
                            'description' => null,
                            'defaultValue' => ['field' => 'CREATED_AT', 'direction' => 'DESC'],
                        ],
                        [
                            'name' => 'value',
                            'type' => $globalVariable->get('typeResolver')->resolve('YesNoPairedVoteValue'),
                            'description' => 'Filters vote by value',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Opinion\\OpinionVotesResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'title' => [
                    'type' => Type::nonNull(Type::string()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The title of the contribution.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'body' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('HTML')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The content of the contribution.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'bodyText' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('HTML')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The content of the contribution.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'reportings' => [
                    'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('Reporting')),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["version_reportings", array(0 => $value)]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'section' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('Section')),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["proposition_section", array(0 => $value)]);
                    },
                    'description' => 'The section of the parent opinion.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'answer' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('Answer'),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $value->getAnswer();
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'parent' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('Opinion')),
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
                'viewerVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('OpinionVote'),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Opinion\\OpinionViewerVoteResolver", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]);
                    },
                    'description' => 'The viewer vote.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'diff' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('HTML'),
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
                return [$globalVariable->get('typeResolver')->resolve('Node'), $globalVariable->get('typeResolver')->resolve('Contribution'), $globalVariable->get('typeResolver')->resolve('Sourceable'), $globalVariable->get('typeResolver')->resolve('Argumentable'), $globalVariable->get('typeResolver')->resolve('TrashableContribution'), $globalVariable->get('typeResolver')->resolve('ContributionWithAuthor'), $globalVariable->get('typeResolver')->resolve('EditableContribution')];
            },
            'isTypeOf' => null,
            'resolveField' => null,
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
