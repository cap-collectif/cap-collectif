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
final class CollectStepType extends ObjectType implements GeneratedTypeInterface
{
    const NAME = 'CollectStep';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'CollectStep',
            'description' => 'Fetches an object given its ID',
            'fields' => function () use ($globalVariable) {
                return [
                'proposals' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ProposalConnection')),
                    'args' => [
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come after the specified cursor.',
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => null,
                            'defaultValue' => 100,
                        ],
                        [
                            'name' => 'before',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come before the specified cursor.',
                        ],
                        [
                            'name' => 'last',
                            'type' => Type::int(),
                            'description' => 'Returns the last `n` elements from the list.',
                        ],
                        [
                            'name' => 'district',
                            'type' => Type::id(),
                            'description' => 'If non-null, filters proposals with the given district.',
                        ],
                        [
                            'name' => 'userType',
                            'type' => Type::id(),
                            'description' => 'If non-null, filters proposals with the given type of author.',
                        ],
                        [
                            'name' => 'category',
                            'type' => Type::id(),
                            'description' => 'If non-null, filters proposals with the given category.',
                        ],
                        [
                            'name' => 'author',
                            'type' => Type::id(),
                            'description' => 'If non-null, filters proposals with the given author.',
                        ],
                        [
                            'name' => 'status',
                            'type' => Type::id(),
                            'description' => 'If non-null, filters proposals with the given status.',
                        ],
                        [
                            'name' => 'theme',
                            'type' => Type::id(),
                            'description' => 'If non-null, filters proposals with the given theme.',
                        ],
                        [
                            'name' => 'term',
                            'type' => Type::string(),
                            'description' => 'If non-null, filters proposals with the given string to look for.',
                        ],
                        [
                            'name' => 'orderBy',
                            'type' => $globalVariable->get('typeResolver')->resolve('ProposalOrder'),
                            'description' => 'Ordering options for proposals returned from the connection.',
                            'defaultValue' => ['field' => 'PUBLISHED_AT', 'direction' => 'ASC'],
                        ],
                        [
                            'name' => 'affiliations',
                            'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('ProposalAffiliation')),
                            'description' => 'Affiliation options for proposals returned from the connection.',
                        ],
                        [
                            'name' => 'includeUnpublished',
                            'type' => Type::boolean(),
                            'description' => '(ROLE_SUPER_ADMIN only) Select also unpublished proposals.',
                            'defaultValue' => false,
                        ],
                        [
                            'name' => 'trashedStatus',
                            'type' => $globalVariable->get('typeResolver')->resolve('ProposalTrashedStatus'),
                            'description' => 'If non-null, filters proposals with the given trashed status.',
                            'defaultValue' => 'NOT_TRASHED',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Step\\CollectStepProposalResolver", array(0 => $value, 1 => $args, 2 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), 3 => $globalVariable->get('container')->get("request_stack"))]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'viewerProposalsUnpublished' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ProposalConnection'),
                    'args' => [
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come after the specified cursor.',
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => 'Returns the first `n` elements from the list.',
                            'defaultValue' => 100,
                        ],
                        [
                            'name' => 'before',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come before the specified cursor.',
                        ],
                        [
                            'name' => 'last',
                            'type' => Type::int(),
                            'description' => 'Returns the last `n` elements from the list.',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\CollectStep\\CollectStepViewerProposalsUnpublishedResolver", array(0 => $value, 1 => $args, 2 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]);
                    },
                    'description' => 'The viewer unpublished proposals (only visible by viewer).',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'kind' => [
                    'type' => Type::nonNull(Type::string()),
                    'args' => [
                    ],
                    'resolve' => function () use ($globalVariable) {
                        return 'collect';
                    },
                    'description' => 'The kind of the step',
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
                    'description' => 'The title of the step.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'show_url' => [
                    'type' => Type::nonNull(Type::string()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Step\\StepUrlResolver", array(0 => $value)]);
                    },
                    'description' => 'The url of the step',
                    'deprecationReason' => $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Deprecation")->toString(array("startAt" => "2019-01-01", "reason" => "This field does not respect naming consistency.", "supersededBy" => "Use `url` instead.")),
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'url' => [
                    'type' => Type::nonNull(Type::string()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Step\\StepUrlResolver", array(0 => $value)]);
                    },
                    'description' => 'The url of the step',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'requirements' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('RequirementConnection')),
                    'args' => [
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come after the specified cursor.',
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => 'Returns the first `n` elements from the list.',
                            'defaultValue' => 100,
                        ],
                        [
                            'name' => 'before',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come before the specified cursor.',
                        ],
                        [
                            'name' => 'last',
                            'type' => Type::int(),
                            'description' => 'Returns the last `n` elements from the list.',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Requirement\\StepRequirementsResolver", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), 2 => $args)]);
                    },
                    'description' => 'The requirements to vote on this step.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'project' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('Project'),
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
                'votesLimit' => [
                    'type' => Type::int(),
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
                'budget' => [
                    'type' => Type::int(),
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
                'voteType' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ProposalStepVoteType')),
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
                'votesHelpText' => [
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
                'voteThreshold' => [
                    'type' => Type::int(),
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
                'open' => [
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
                'votesRanking' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'If enabled, allow voters to order their votes by preferences.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'viewerVotes' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ProposalVoteConnection')),
                    'args' => [
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come after the specified cursor.',
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => null,
                            'defaultValue' => 100000,
                        ],
                        [
                            'name' => 'before',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come before the specified cursor.',
                        ],
                        [
                            'name' => 'last',
                            'type' => Type::int(),
                            'description' => 'Returns the last `n` elements from the list.',
                        ],
                        [
                            'name' => 'orderBy',
                            'type' => $globalVariable->get('typeResolver')->resolve('ProposalVotesOrder'),
                            'description' => null,
                            'defaultValue' => ['field' => 'CREATED_AT', 'direction' => 'DESC'],
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\ViewerStepVotesResolver", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), 2 => $args)]);
                    },
                    'description' => 'A list of viewer votes associated with the step.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'form' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ProposalForm')),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $value->getProposalForm();
                    },
                    'description' => null,
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
                    'description' => 'The ID of an object',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'statuses' => [
                    'type' => Type::nonNull(Type::listOf(Type::nonNull($globalVariable->get('typeResolver')->resolve('Status')))),
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
                'private' => [
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
                'contributors' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('InternalUserConnection')),
                    'args' => [
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come after the specified cursor.',
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => 'Returns the first `n` elements from the list.',
                            'defaultValue' => 100,
                        ],
                        [
                            'name' => 'before',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come before the specified cursor.',
                        ],
                        [
                            'name' => 'last',
                            'type' => Type::int(),
                            'description' => 'Returns the last `n` elements from the list.',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Step\\StepContributorResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'A list of contributor associated with the step.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'viewerProposalDrafts' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ProposalConnection')),
                    'args' => [
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come after the specified cursor.',
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => 'Returns the first `n` elements from the list.',
                            'defaultValue' => 100,
                        ],
                        [
                            'name' => 'before',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come before the specified cursor.',
                        ],
                        [
                            'name' => 'last',
                            'type' => Type::int(),
                            'description' => 'Returns the last `n` elements from the list.',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["query_get_draft_proposals_for_user_in_step", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), 2 => $args)]);
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
            ];
            },
            'interfaces' => function () use ($globalVariable) {
                return [$globalVariable->get('typeResolver')->resolve('Node'), $globalVariable->get('typeResolver')->resolve('Step'), $globalVariable->get('typeResolver')->resolve('ProposalStep')];
            },
            'isTypeOf' => null,
            'resolveField' => null,
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
