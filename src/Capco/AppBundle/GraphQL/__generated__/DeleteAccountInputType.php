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
final class DeleteAccountInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'DeleteAccountInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'DeleteAccountInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'type' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DeleteAccountType')),
                    'description' => 'You must chose a strategy to delete your account',
                ],
                'userId' => [
                    'type' => Type::id(),
                    'description' => '(ROLE_SUPER_ADMIN only) The user to delete',
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
