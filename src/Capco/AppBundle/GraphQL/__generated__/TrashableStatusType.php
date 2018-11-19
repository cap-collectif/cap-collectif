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
final class TrashableStatusType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'TrashableStatus';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'TrashableStatus',
            'values' => [
                'INVISIBLE' => [
                    'name' => 'INVISIBLE',
                    'value' => \constant("Capco\\AppBundle\\Entity\\Interfaces\\Trashable::STATUS_INVISIBLE"),
                    'deprecationReason' => null,
                    'description' => 'Content is not visible.',
                ],
                'VISIBLE' => [
                    'name' => 'VISIBLE',
                    'value' => \constant("Capco\\AppBundle\\Entity\\Interfaces\\Trashable::STATUS_VISIBLE"),
                    'deprecationReason' => null,
                    'description' => 'Content is visible.',
                ],
            ],
            'description' => 'Different trashable status.',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
