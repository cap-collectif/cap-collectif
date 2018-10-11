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
final class ProposalPublicationStatusType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'ProposalPublicationStatus';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ProposalPublicationStatus',
            'values' => [
                'PUBLISHED' => [
                    'name' => 'PUBLISHED',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProposalPublicationStatus::PUBLISHED"),
                    'deprecationReason' => null,
                    'description' => 'Publicly visible',
                ],
                'TRASHED' => [
                    'name' => 'TRASHED',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProposalPublicationStatus::TRASHED"),
                    'deprecationReason' => null,
                    'description' => 'Publicly visible in the trash bin',
                ],
                'TRASHED_NOT_VISIBLE' => [
                    'name' => 'TRASHED_NOT_VISIBLE',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProposalPublicationStatus::TRASHED_NOT_VISIBLE"),
                    'deprecationReason' => null,
                    'description' => 'In the trash bin, content not visible',
                ],
                'DELETED' => [
                    'name' => 'DELETED',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProposalPublicationStatus::DELETED"),
                    'deprecationReason' => null,
                    'description' => 'Not publicly visible, deleted by author',
                ],
                'DRAFT' => [
                    'name' => 'DRAFT',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProposalPublicationStatus::DRAFT"),
                    'deprecationReason' => null,
                    'description' => 'Draft, not publicly visible, only showed for his author.',
                ],
                'UNPUBLISHED' => [
                    'name' => 'UNPUBLISHED',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProposalPublicationStatus::UNPUBLISHED"),
                    'deprecationReason' => null,
                    'description' => 'Visible by author only.',
                ],
            ],
            'description' => 'Available statuses',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
