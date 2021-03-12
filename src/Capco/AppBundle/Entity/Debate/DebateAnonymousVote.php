<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Repository\Debate\DebateAnonymousVoteRepository;
use Capco\AppBundle\Traits\AuthorInformationTrait;
use Capco\AppBundle\Traits\ContributionOriginTrait;
use Capco\AppBundle\Traits\DebatableTrait;
use Capco\AppBundle\Traits\ForAgainstTrait;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=DebateAnonymousVoteRepository::class)
 * @ORM\Table(name="debate_anonymous_vote")
 */
class DebateAnonymousVote implements IndexableInterface
{
    use AuthorInformationTrait;
    use ContributionOriginTrait;
    use DebatableTrait;
    use ForAgainstTrait;
    use IdTrait;
    use TimestampableTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Debate\Debate")
     * @ORM\JoinColumn(name="debate_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private Debate $debate;

    /**
     * @ORM\Column(type="string", nullable=false, length=255)
     */
    private string $token;

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): self
    {
        $this->token = $token;

        return $this;
    }

    public function getStep(): ?DebateStep
    {
        return $this->getDebate()->getStep();
    }

    public function getProject(): ?Project
    {
        return $this->getDebate()
            ->getStep()
            ->getProject();
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'debateAnonymousVote';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'ElasticsearchVote',
            'ElasticsearchDebateAnonymousVote',
            'ElasticsearchVoteNestedProject',
            'ElasticsearchVoteNestedStep',
        ];
    }

    public static function getElasticsearchPriority(): int
    {
        return 6;
    }

    /**
     * For ES.
     */
    public function getVoteType(): string
    {
        return $this->getType();
    }
}
