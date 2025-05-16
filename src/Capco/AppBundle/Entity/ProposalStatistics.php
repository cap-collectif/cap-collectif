<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Repository\ProposalStatisticsRepository;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="proposal_statistics")
 * @ORM\Entity(repositoryClass=ProposalStatisticsRepository::class)
 */
class ProposalStatistics extends AbstractStatistics implements EntityInterface, IndexableInterface
{
    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="statistics", cascade={"persist"})
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private ?Proposal $proposal = null;

    public function __construct(int $nbrOfMessagesSentToAuthor = 0)
    {
        parent::__construct($nbrOfMessagesSentToAuthor);
    }

    public function getProposal(): ?Proposal
    {
        return $this->proposal;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;

        if ($proposal->getStatistics() !== $this) {
            $proposal->getStatistics();
        }

        return $this;
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        return 6;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'statistics';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'ElasticsearchProposalStatistics',
            'ElasticsearchProposalNestedProposalStatistics',
        ];
    }
}
