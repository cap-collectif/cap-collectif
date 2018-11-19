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
final class ReplyType extends ObjectType implements GeneratedTypeInterface
{
    const NAME = 'Reply';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'Reply',
            'description' => 'A Reply',
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
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Reply\\ReplyUrlResolver", array(0 => $value)]);
                    },
                    'description' => 'The HTTP show url for this contribution.',
                    'deprecationReason' => $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Deprecation")->toString(array("startAt" => "2019-01-01", "reason" => "This field does not respect naming consistency.", "supersededBy" => "Use `url` instead.")),
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
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Reply\\ReplyUrlResolver", array(0 => $value)]);
                    },
                    'description' => 'Url of the contribution',
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
                'draft' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Is the object a draft.',
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
                'publicationStatus' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ReplyPublicationStatus')),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Reply\\ReplyPublicationStatusResolver", array(0 => $value)]);
                    },
                    'description' => 'The reply status.',
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
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'responses' => [
                    'type' => Type::nonNull(Type::listOf($globalVariable->get('typeResolver')->resolve('Response'))),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Reply\\ReplyResponsesResolver", array(0 => $value)]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'author' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('InternalUser')),
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
                    'description' => 'The updated date.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'questionnaire' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('InternalQuestionnaire')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Identifies the form where the contribution was submitted.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'viewerCanUpdate' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Reply\\ReplyViewerCanUpdateResolver", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]);
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
                'viewerCanDelete' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Reply\\ReplyViewerCanDeleteResolver", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]);
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
                return [$globalVariable->get('typeResolver')->resolve('Node'), $globalVariable->get('typeResolver')->resolve('Publishable'), $globalVariable->get('typeResolver')->resolve('Draftable'), $globalVariable->get('typeResolver')->resolve('Contribution')];
            },
            'isTypeOf' => null,
            'resolveField' => null,
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
