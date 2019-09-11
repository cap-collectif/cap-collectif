<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Model\Publishable;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Traits\PinnableTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TrashableTrait;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\AppBundle\Traits\PublishableTrait;
use Capco\AppBundle\Model\HasAuthorInterface;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Model\CommentableInterface;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Entity\Interfaces\VotableInterface;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\CommentRepository")
 * @ORM\Table(name="comment", indexes={
 *    @ORM\Index(name="proposal_comment_idx", columns={"id", "proposal_id"}),
 *    @ORM\Index(name="event_comment_idx", columns={"id", "event_id"}),
 *    @ORM\Index(name="parent_comment_idx", columns={"id", "parent_id"}),
 *    @ORM\Index(name="author_comment_idx", columns={"id", "author_id"}),
 *    @ORM\Index(name="post_comment_idx", columns={"id", "post_id"}),
 *    @ORM\Index(name="comment_idx_published_id_id", columns={"id", "author_id", "published"}),
 *    @ORM\Index(name="comment_idx_published_trashed_at_proposal_id_object_type_id", columns={"published","trashed_at","proposal_id","objectType","id"})
 * })
 * @ORM\HasLifecycleCallbacks()
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "objectType", type = "string")
 * @ORM\DiscriminatorMap({
 *      "event"    = "EventComment",
 *      "post"     = "PostComment",
 *      "proposal" = "ProposalComment"
 * })
 * @CapcoAssert\HasAuthor
 */
abstract class Comment implements
    Publishable,
    Trashable,
    Contribution,
    VotableInterface,
    HasAuthorInterface,
    CommentableInterface
{
    use VotableOkTrait;
    use PinnableTrait;
    use UuidTrait;
    use TextableTrait;
    use TimestampableTrait;
    use TrashableTrait;
    use PublishableTrait;

    public static $sortCriterias = [
        'date' => 'argument.sort.date',
        'popularity' => 'argument.sort.popularity'
    ];

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @var User
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="comments")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected $Author;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Comment", inversedBy="answers")
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected $parent;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Comment", mappedBy="parent", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    protected $answers;

    /**
     * @var
     *
     * @ORM\Column(name="author_name", type="string", nullable=true)
     */
    protected $authorName;

    /**
     * @var
     *
     * @ORM\Column(name="author_email", type="string", nullable=true)
     * @Assert\Email(message="comment.create.invalid_email_error")
     */
    protected $authorEmail;

    /**
     * @ORM\Column(name="author_ip", type="string", nullable=true)
     * @Assert\Ip(version="all")
     */
    protected $authorIp;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="Comment", cascade={"persist", "remove"})
     */
    protected $Reports;

    public function __construct()
    {
        $this->votes = new ArrayCollection();
        $this->answers = new ArrayCollection();
        $this->Reports = new ArrayCollection();
        $this->updatedAt = new \DateTime();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getBodyExcerpt(50) : 'New comment';
    }

    public function getKind(): string
    {
        return 'comment';
    }

    public function getRelated()
    {
        return null;
    }

    public function getStep()
    {
        return null;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $value): self
    {
        $this->createdAt = $value;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $value): self
    {
        $this->updatedAt = $value;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->Author;
    }

    public function setAuthor(?User $Author): self
    {
        $this->Author = $Author;
        $this->setPinned($Author && $Author->isVip() && !$this->parent);

        return $this;
    }

    public function getParent(): ?self
    {
        return $this->parent;
    }

    public function setParent(?self $parent): self
    {
        $this->parent = $parent;
        $this->setPinned($this->pinned && !$parent);

        return $this;
    }

    public function getAuthorName(): ?string
    {
        return $this->authorName;
    }

    public function setAuthorName(?string $authorName): self
    {
        $this->authorName = $authorName;

        return $this;
    }

    public function getAuthorEmail(): ?string
    {
        return $this->authorEmail;
    }

    public function setAuthorEmail(?string $authorEmail): self
    {
        $this->authorEmail = $authorEmail;

        return $this;
    }

    public function getAuthorIp(): ?string
    {
        return $this->authorIp;
    }

    public function setAuthorIp(?string $authorIp): self
    {
        $this->authorIp = $authorIp;

        return $this;
    }

    public function getAnswers(): Collection
    {
        return $this->answers;
    }

    public function addAnswer(self $answer): self
    {
        if (!$this->answers->contains($answer)) {
            $this->answers->add($answer);
        }

        return $this;
    }

    public function removeAnswer(self $answer): self
    {
        $this->answers->removeElement($answer);

        return $this;
    }

    public function getReports(): ?Collection
    {
        return $this->Reports;
    }

    public function addReport(Reporting $report): self
    {
        if (!$this->Reports->contains($report)) {
            $this->Reports->add($report);
        }

        return $this;
    }

    public function removeReport(Reporting $report): self
    {
        $this->Reports->removeElement($report);

        return $this;
    }

    // ************************ Custom methods *********************************

    public function userHasReport(User $user = null): bool
    {
        if (null !== $user) {
            foreach ($this->Reports as $report) {
                if ($report->getReporter() === $user) {
                    return true;
                }
            }
        }

        return false;
    }

    public function canDisplay($user = null): bool
    {
        return $this->isPublished() && $this->canDisplayRelatedObject($user);
    }

    public function canContribute($user = null): bool
    {
        return $this->isPublished() &&
            !$this->isTrashed() &&
            $this->canContributeToRelatedObject($user);
    }

    public function canVote(): bool
    {
        return $this->isPublished() && !$this->isTrashed();
    }

    public function removeCommentFromRelatedObject(): void
    {
        if ($this->getRelatedObject()) {
            $this->getRelatedObject()->removeComment($this);
        }
    }

    public function canDisplayRelatedObject(?User $user = null): bool
    {
        if ($this->getRelatedObject() instanceof ProposalComment) {
            return $this->getRelatedObject()->canDisplay($user);
        }

        return $this->getRelatedObject() ? $this->getRelatedObject()->canDisplay($user) : false;
    }

    public function canContributeToRelatedObject(?User $user = null): bool
    {
        return $this->getRelatedObject() ? $this->getRelatedObject()->canDisplay($user) : false;
    }

    public function getProject(): ?Project
    {
        $relatedObject = $this->getRelatedObject();
        if ($relatedObject instanceof Proposal) {
            return $relatedObject->getProject();
        }

        return null;
    }

    // ********************** Abstract methods **********************************

    abstract public function getRelatedObject();

    abstract public function setRelatedObject($object);

    // ************************* Lifecycle ***********************************

    /**
     * @ORM\PreRemove
     */
    public function deleteComment(): void
    {
        $this->removeCommentFromRelatedObject();
    }

    public function isIndexable(): bool
    {
        return $this->isPublished();
    }

    public static function getElasticsearchPriority(): int
    {
        return 5;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'comment';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['ElasticsearchComment', 'ElasticsearchNestedAuthor'];
    }
}
