<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Model\ReportableInterface;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Model\Publishable;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\DebatableTrait;
use Capco\AppBundle\Traits\HasAuthorTrait;
use Capco\AppBundle\Traits\ModerableTrait;
use Capco\AppBundle\Traits\TrashableTrait;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\AppBundle\Traits\ForAgainstTrait;
use Capco\AppBundle\Traits\ReportableTrait;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Traits\PublishableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Interfaces\VotableInterface;

/**
 * An argument in a debate.
 *
 * @ORM\Table(name="debate_argument", indexes={
 *     @ORM\Index(name="idx_author", columns={"id", "author_id"})
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DebateArgumentRepository")
 */
class DebateArgument implements Contribution, VotableInterface, ReportableInterface, Publishable
{
    use UuidTrait;
    use VotableOkTrait; //@TODO remove votesCount when entity is added to elasticsearch
    use TextableTrait;
    use ModerableTrait;
    use PublishableTrait;
    use TrashableTrait;
    use ForAgainstTrait;
    use ReportableTrait;
    use HasAuthorTrait;
    use DebatableTrait;
    use TimestampableTrait;

    public const TYPE_AGAINST = 0;
    public const TYPE_FOR = 1;

    /**
     * @Gedmo\Timestampable(on="change", field={"body"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private \DateTime $updatedAt;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="debateArgument", cascade={"persist", "remove"})
     */
    private Collection $reports;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Debate\Debate", inversedBy="arguments")
     * @ORM\JoinColumn(name="debate_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private Debate $debate;

    public function __construct(Debate $debate)
    {
        $this->debate = $debate;
        $this->votes = new ArrayCollection();
        $this->reports = new ArrayCollection();
    }

    public function getStep(): ?DebateStep
    {
        if ($this->getDebate()) {
            return $this->getDebate()->getStep();
        }

        return null;
    }

    public function getKind(): string
    {
        return 'debateArgument';
    }

    public function getRelated(): Debate
    {
        return $this->debate;
    }

    public function getProject(): ?Project
    {
        if ($this->getStep()) {
            return $this->getStep()->getProject();
        }

        return null;
    }

    public function isIndexable(): bool
    {
        return false;
    }

    public static function getElasticsearchPriority(): int
    {
        return 9;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'debateArgument';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [];
    }
}
