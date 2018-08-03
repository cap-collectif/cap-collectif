<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\EnumType;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class DeleteAccountTypeType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'DeleteAccountType';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'DeleteAccountType',
            'values' => [
                'SOFT' => [
                    'name' => 'SOFT',
                    'value' => 'SOFT',
                    'deprecationReason' => null,
                    'description' => 'Anonymize the user and delete his content only on active steps',
                ],
                'HARD' => [
                    'name' => 'HARD',
                    'value' => 'HARD',
                    'deprecationReason' => null,
                    'description' => 'Anonymize the user and delete his content',
                ],
            ],
            'description' => 'Differents strategies to delete an account',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
