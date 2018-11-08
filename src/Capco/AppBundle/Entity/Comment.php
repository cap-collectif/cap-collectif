<?php
namespace Capco\AppBundle\Entity;

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
 * @ORM\Table(name="comment")
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
        'popularity' => 'argument.sort.popularity',
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
        $this->updatedAt = new \Datetime();
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

    /**
     * Get createdAt.
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $value): self
    {
        $this->createdAt = $value;

        return $this;
    }

    /**
     * Get updatedAt.
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $value): self
    {
        $this->updatedAt = $value;

        return $this;
    }

    public function getAuthor()
    {
        return $this->Author;
    }

    /**
     * @param User $Author
     *
     * @return $this
     */
    public function setAuthor($Author)
    {
        $this->Author = $Author;
        $this->setPinned($Author && $Author->isVip() && !$this->parent);

        return $this;
    }

    public function getParent(): ?self
    {
        return $this->parent;
    }

    /**
     * @param mixed $parent
     */
    public function setParent($parent)
    {
        $this->parent = $parent;
        $this->setPinned($this->pinned && !$parent);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getAuthorName()
    {
        return $this->authorName;
    }

    /**
     * @param mixed $authorName
     */
    public function setAuthorName($authorName)
    {
        $this->authorName = $authorName;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getAuthorEmail()
    {
        return $this->authorEmail;
    }

    /**
     * @param mixed $authorEmail
     */
    public function setAuthorEmail($authorEmail)
    {
        $this->authorEmail = $authorEmail;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getAuthorIp()
    {
        return $this->authorIp;
    }

    /**
     * @param mixed $authorIp
     */
    public function setAuthorIp($authorIp)
    {
        $this->authorIp = $authorIp;

        return $this;
    }

    /**
     * @return ArrayCollection
     */
    public function getAnswers()
    {
        return $this->answers;
    }

    /**
     * @param $answer
     *
     * @return $this
     */
    public function addAnswer($answer)
    {
        if (!$this->answers->contains($answer)) {
            $this->answers->add($answer);
        }

        return $this;
    }

    /**
     * @param $answer
     *
     * @return $this
     */
    public function removeAnswer($answer)
    {
        $this->answers->removeElement($answer);

        return $this;
    }

    /**
     * @return string
     */
    public function getReports()
    {
        return $this->Reports;
    }

    /**
     * @param Reporting $report
     *
     * @return $this
     */
    public function addReport(Reporting $report)
    {
        if (!$this->Reports->contains($report)) {
            $this->Reports->add($report);
        }

        return $this;
    }

    /**
     * @param Reporting $report
     *
     * @return $this
     */
    public function removeReport(Reporting $report)
    {
        $this->Reports->removeElement($report);

        return $this;
    }

    // ************************ Custom methods *********************************

    /**
     * @param User $user
     *
     * @return bool
     */
    public function userHasReport(User $user = null)
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

    public function removeCommentFromRelatedObject()
    {
        $this->getRelatedObject()->removeComment($this);
    }

    public function canDisplayRelatedObject($user = null): bool
    {
        if ($this->getRelatedObject() instanceof ProposalComment) {
            return $this->getRelatedObject()->canDisplay($user);
        }

        return $this->getRelatedObject()->canDisplay($user);
    }

    /**
     * @return bool
     */
    public function canContributeToRelatedObject($user = null)
    {
        return $this->getRelatedObject()->canContribute($user);
    }

    // ********************** Abstract methods **********************************

    /**
     * @return mixed
     */
    abstract public function getRelatedObject();

    /**
     * @param $object
     *
     * @return mixed
     */
    abstract public function setRelatedObject($object);

    // ************************* Lifecycle ***********************************

    /**
     * @ORM\PreRemove
     */
    public function deleteComment()
    {
        $this->removeCommentFromRelatedObject();
    }

    public function isIndexable(): bool
    {
        return $this->isPublished();
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'comment';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch'];
    }
}
