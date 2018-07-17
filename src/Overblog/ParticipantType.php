<?php
namespace Overblog\GraphQLBundle\__DEFINITIONS__;

use GraphQL\Type\Definition\UnionType;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class ParticipantType extends UnionType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'Participant',
                'types' =>
                    function () use ($globalVariable) {
                        return [
                            $globalVariable->get('typeResolver')->resolve('User'),
                            $globalVariable->get('typeResolver')->resolve('NotRegistered'),
                        ];
                    },
                'resolveType' =>
                    function ($value, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable
                            ->get('resolverResolver')
                            ->resolve([
                                "Capco\\AppBundle\\GraphQL\\Resolver\\Participant\\ParticipantTypeResolver",
                                array(0 => $value),
                            ]);
                    },
                'description' => 'User and NotRegistered',
            ];
        };
        $config = $configProcessor
            ->process(LazyConfig::create($configLoader, $globalVariables))
            ->load();
        parent::__construct($config);
    }
}
