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
final class UpdateFollowOpinionInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'UpdateFollowOpinionInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'UpdateFollowOpinionInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'opinionId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The opinion id',
                ],
                'notifiedOf' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('SubscriptionTypeValue')),
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
