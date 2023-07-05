<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Entity\Interfaces\DebateArgumentInterface;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Traits\AuthorableTrait;
use Capco\AppBundle\Traits\AuthorInformationTrait;
use Capco\AppBundle\Traits\ContributionOriginTrait;
use Capco\AppBundle\Traits\DebatableTrait;
use Capco\AppBundle\Traits\ForAgainstTrait;
use Capco\AppBundle\Traits\ModerableTrait;
use Capco\AppBundle\Traits\PublishableTrait;
use Capco\AppBundle\Traits\ReportableTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TrashableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\Index;
use Doctrine\ORM\Mapping\UniqueConstraint;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * An argument in a debate.
 *
 * @ORM\Table(
 *     name="debate_argument",
 *     indexes={
 *       @Index(name="idx_author", columns={"id", "author_id"})
 *     },
 *     uniqueConstraints={
 *        @UniqueConstraint(
 *            name="argument_debate_unique",
 *            columns={"debate_id", "author_id"}
 *        )
 *     }
 * )
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DebateArgumentRepository")
 * @CapcoAssert\HasAuthor()
 */
class DebateArgument implements DebateArgumentInterface, Publishable
{
    use AuthorableTrait;
    use AuthorInformationTrait;
    use ContributionOriginTrait;
    use DebatableTrait;
    use ForAgainstTrait;
    use ModerableTrait;
    use PublishableTrait;
    use ReportableTrait;
    use TextableTrait;
    use TimestampableTrait;
    use TrashableTrait;
    use UuidTrait;
    use VotableOkTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="debateArguments")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    protected ?User $author = null;

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

    public function __toString(): string
    {
        if ($this->id) {
            return $this->getBodyText();
        }

        return 'New debate argument';
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
        return true;
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
        return [
            'ElasticsearchDebateArgument',
            'ElasticsearchDebateArgumentNestedAuthor',
            'ElasticsearchDebateArgumentNestedProject',
            'ElasticsearchDebateArgumentNestedStep',
        ];
    }
}
