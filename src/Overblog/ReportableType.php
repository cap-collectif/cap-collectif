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
final class ReportableType extends InterfaceType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'Reportable',
                'description' => 'A reportable',
                'fields' =>
                    function () use ($globalVariable) {
                        return [
                            'viewerHasReport' => [
                                'type' => Type::nonNull(Type::boolean()),
                                'args' => [],
                                'resolve' => null,
                                'description' => 'Does the viewer already submitted a report ?',
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' =>
                                    function (
                                        $value,
                                        $args,
                                        $context,
                                        ResolveInfo $info,
                                        $object
                                    ) use ($globalVariable) {
                                        return $globalVariable
                                            ->get('container')
                                            ->get('security.authorization_checker')
                                            ->isGranted("ROLE_USER");
                                    },
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
