<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Model\HasDiffInterface;
use Capco\AppBundle\Traits\AnswerableTrait;
use Capco\AppBundle\Traits\AuthorableTrait;
use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\DiffableTrait;
use Capco\AppBundle\Traits\FollowableTrait;
use Capco\AppBundle\Traits\ModerableTrait;
use Capco\AppBundle\Traits\PublishableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TrashableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Traits\VotableOkNokMitigeTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="opinion_version", indexes={
 *     @ORM\Index(name="idx_author", columns={"id", "author_id"})
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionVersionRepository")
 * @ORM\HasLifecycleCallbacks()
 * @CapcoAssert\HasAuthor()
 */
class OpinionVersion implements OpinionContributionInterface, HasDiffInterface, ExportableContributionInterface, \Stringable
{
    use AnswerableTrait;
    use AuthorableTrait;
    use BodyUsingJoditWysiwygTrait;
    use DiffableTrait;
    use FollowableTrait;
    use ModerableTrait;
    use PublishableTrait;
    use SluggableTitleTrait;
    use TextableTrait;
    use TimestampableTrait;
    use TrashableTrait;
    use UuidTrait;
    use VotableOkNokMitigeTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="opinionVersions")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected ?User $author = null;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Argument", mappedBy="opinionVersion", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    protected $arguments;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Source", mappedBy="opinionVersion", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    protected $sources;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="opinionVersion", cascade={"persist", "remove"})
     */
    protected $reports;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "body", "comment"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected $updatedAt;

    /**
     * @ORM\Column(name="ranking", type="integer", nullable=true)
     */
    protected $ranking;

    /**
     * @ORM\Column(name="comment", type="text", nullable=true)
     */
    private $comment;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="versions", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $parent;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Follower", mappedBy="opinionVersion", cascade={"persist"})
     */
    private $followers;

    /**
     * @ORM\Column(name="comment_using_jodit_wysiwyg", type="boolean", nullable=false, options={"default": false})
     */
    private bool $commentUsingJoditWysiwyg = false;

    public function __construct()
    {
        $this->arguments = new ArrayCollection();
        $this->sources = new ArrayCollection();
        $this->votes = new ArrayCollection();
        $this->reports = new ArrayCollection();
        $this->followers = new ArrayCollection();
    }

    public function __toString(): string
    {
        return $this->getId() ? $this->getTitle() : 'New opinion version';
    }

    public function isCommentUsingJoditWysiwyg(): bool
    {
        return $this->commentUsingJoditWysiwyg;
    }

    public function setCommentUsingJoditWysiwyg(bool $commentUsingJoditWysiwyg): self
    {
        $this->commentUsingJoditWysiwyg = $commentUsingJoditWysiwyg;

        return $this;
    }

    public function getKind(): string
    {
        return 'version';
    }

    public function getProject(): ?Project
    {
        return $this->getParent() && $this->getParent()->getStep()
            ? $this->getParent()
                ->getStep()
                ->getProject()
            : null;
    }

    public function getStep(): ?AbstractStep
    {
        return $this->getParent()->getStep();
    }

    public function getRelated()
    {
        return $this->getParent();
    }

    public function getReports(): iterable
    {
        return $this->reports;
    }

    public function addReport(Reporting $report)
    {
        if (!$this->reports->contains($report)) {
            $this->reports->add($report);
        }

        return $this;
    }

    public function removeReport(Reporting $report)
    {
        $this->reports->removeElement($report);

        return $this;
    }

    public function getComment()
    {
        return $this->comment;
    }

    public function setComment($comment)
    {
        $this->comment = $comment;

        return $this;
    }

    public function setParent(Opinion $parent)
    {
        $this->parent = $parent;

        return $this;
    }

    public function getParent(): ?Opinion
    {
        return $this->parent;
    }

    public function getConsultation(): ?Consultation
    {
        return $this->getParent() ? $this->getParent()->getConsultation() : null;
    }

    /**
     * @return mixed
     */
    public function getArguments()
    {
        return $this->arguments;
    }

    public function setArguments(mixed $arguments)
    {
        $this->arguments = $arguments;
    }

    /**
     * @param $argument
     *
     * @return $this
     */
    public function addArgument(Argument $argument)
    {
        if (!$this->arguments->contains($argument)) {
            $this->arguments->add($argument);
        }

        return $this;
    }

    /**
     * @return $this
     */
    public function removeArgument(Argument $argument)
    {
        $this->arguments->removeElement($argument);

        return $this;
    }

    public function getSources(): Collection
    {
        return $this->sources;
    }

    public function setSources($sources)
    {
        $this->sources = $sources;
    }

    public function addSource($source)
    {
        if (!$this->sources->contains($source)) {
            $this->sources->add($source);
        }

        return $this;
    }

    public function removeSource($source)
    {
        $this->sources->removeElement($source);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getRanking()
    {
        return $this->ranking;
    }

    public function setRanking(mixed $ranking)
    {
        $this->ranking = $ranking;
    }

    // ******************************* Custom methods **************************************

    public function getOpinionType(): ?OpinionType
    {
        if ($this->parent) {
            return $this->parent->getOpinionType();
        }

        return null;
    }

    public function getCommentSystem()
    {
        if ($this->parent) {
            return $this->parent->getCommentSystem();
        }

        return null;
    }

    /**
     * @deprecated: please consider using `viewerCanSee` instead.
     *
     * @param null|mixed $user
     */
    public function canDisplay($user = null): bool
    {
        return ($this->isPublished() && $this->getParent()->canDisplay($user))
            || $this->getAuthor() === $user;
    }

    public function canContribute($user = null): bool
    {
        return ($this->isPublished()
            && !$this->isTrashed()
            && $this->getParent()->canContribute($user))
            || ($this->getParent()->canContribute($user) && $this->getAuthor() === $user);
    }

    public function canBeDeleted($user = null): bool
    {
        return ($this->isPublished()
            && !$this->isTrashed()
            && $this->getParent()->canBeDeleted($user))
            || $this->getAuthor() === $user;
    }

    public function isIndexable(): bool
    {
        return $this->isPublished() && $this->getProject() && $this->getProject()->isIndexable();
    }

    public static function getElasticsearchPriority(): int
    {
        return 8;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'opinionVersion';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'ElasticsearchVersion',
            'ElasticsearchVersionNestedAuthor',
            'ElasticsearchVersionNestedProject',
            'ElasticsearchVersionNestedConsultation',
            'ElasticsearchVersionNestedStep',
            'ElasticsearchVoteNestedVersion',
            'ElasticsearchFollowerNestedVersion',
        ];
    }
}
