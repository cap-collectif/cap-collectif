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
final class TrashableContributionType extends InterfaceType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'TrashableContribution',
                'description' => 'A trashable contribution',
                'fields' =>
                    function () use ($globalVariable) {
                        return [
                            'trashed' => [
                                'type' => Type::nonNull(Type::boolean()),
                                'args' => [],
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
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve([
                                                "proposition_trashedAt",
                                                array(0 => $value),
                                            ]);
                                    },
                                'description' =>
                                    'The moment the moderator trashed the contribution.',
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'trashedReason' => [
                                'type' => Type::string(),
                                'args' => [],
                                'resolve' => null,
                                'description' =>
                                    'The reason the moderator trashed the contribution.',
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
