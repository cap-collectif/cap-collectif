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
final class UpdateProposalFormNotificationsConfigurationInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'UpdateProposalFormNotificationsConfigurationInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'UpdateProposalFormNotificationsConfigurationInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'proposalFormId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => null,
                ],
                'onCreate' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => null,
                ],
                'onUpdate' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => null,
                ],
                'onDelete' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => null,
                ],
                'onCommentCreate' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => null,
                ],
                'onCommentUpdate' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => null,
                ],
                'onCommentDelete' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => null,
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
