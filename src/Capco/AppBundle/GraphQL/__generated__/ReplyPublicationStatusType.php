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
final class ReplyPublicationStatusType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'ReplyPublicationStatus';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ReplyPublicationStatus',
            'values' => [
                'PUBLISHED' => [
                    'name' => 'PUBLISHED',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ReplyPublicationStatus::PUBLISHED"),
                    'deprecationReason' => null,
                    'description' => 'Publicly visible',
                ],
                'DRAFT' => [
                    'name' => 'DRAFT',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ReplyPublicationStatus::DRAFT"),
                    'deprecationReason' => null,
                    'description' => 'Draft, not publicly visible, only showed for his author.',
                ],
            ],
            'description' => 'Available statuses',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
