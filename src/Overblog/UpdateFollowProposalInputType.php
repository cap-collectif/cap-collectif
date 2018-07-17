<?php
namespace Overblog\GraphQLBundle\__DEFINITIONS__;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class UpdateFollowProposalInputType extends InputObjectType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'UpdateFollowProposalInput',
                'description' => null,
                'fields' =>
                    function () use ($globalVariable) {
                        return [
                            'proposalId' => [
                                'type' => Type::nonNull(Type::id()),
                                'description' => 'The proposal id',
                            ],
                            'notifiedOf' => [
                                'type' =>
                                    Type::nonNull(
                                        $globalVariable
                                            ->get('typeResolver')
                                            ->resolve('PickFollowTypeValue')
                                    ),
                                'description' => null,
                            ],
                            'clientMutationId' => ['type' => Type::string(), 'description' => null],
                        ];
                    },
            ];
        };
        $config = $configProcessor
            ->process(LazyConfig::create($configLoader, $globalVariables))
            ->load();
        parent::__construct($config);
    }
}
