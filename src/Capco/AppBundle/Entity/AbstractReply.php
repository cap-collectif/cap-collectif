<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\VoteContribution;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\MappedSuperclass
 */
abstract class AbstractReply implements Contribution, VoteContribution
{
    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        return 4;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'reply';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'ElasticsearchReplyNestedAuthor',
            'ElasticsearchReply',
            'ElasticsearchReplyNestedStep',
            'ElasticsearchReplyNestedProject',
        ];
    }
}
