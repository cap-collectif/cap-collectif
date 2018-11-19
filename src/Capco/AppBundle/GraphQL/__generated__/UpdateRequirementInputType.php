<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class UpdateRequirementInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'UpdateRequirementInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'UpdateRequirementInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'requirement' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The Node ID of the requirement to modify.',
                ],
                'value' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => 'The updated value of the requirement.',
                ],
                'clientMutationId' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
            ];
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
