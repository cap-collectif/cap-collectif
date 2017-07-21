<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\VotableInterface;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\HasAuthorInterface;
use Capco\AppBundle\Traits\ExpirableTrait;
use Capco\AppBundle\Traits\PinnableTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Traits\ValidableTrait;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\CommentRepository")
 * @ORM\Table(name="comment")
 * @ORM\HasLifecycleCallbacks()
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "objectType", type = "string")
 * @ORM\DiscriminatorMap({
 *      "idea"     = "IdeaComment",
 *      "event"    = "EventComment",
 *      "post"     = "PostComment",
 *      "proposal" = "ProposalComment"
 * })
 * @CapcoAssert\HasAuthor
 */
abstract class Comment implements Contribution, VotableInterface, HasAuthorInterface
{
    use ValidableTrait, VotableOkTrait, PinnableTrait, ExpirableTrait, UuidTrait, TextableTrait;

    public static $sortCriterias = [
        'date' => 'argument.sort.date',
        'popularity' => 'argument.sort.popularity',
    ];

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    protected $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    protected $isEnabled = true;

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
     * @var
     *
     * @ORM\Column(name="author_ip", type="string", nullable=true)
     * @Assert\Ip
     */
    protected $authorIp;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="Comment", cascade={"persist", "remove"})
     */
    protected $Reports;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_trashed", type="boolean")
     */
    protected $isTrashed = false;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"isTrashed"})
     * @ORM\Column(name="trashed_at", type="datetime", nullable=true)
     */
    protected $trashedAt = null;

    /**
     * @var string
     *
     * @ORM\Column(name="trashed_reason", type="text", nullable=true)
     */
    protected $trashedReason = null;

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

    /**
     * Get createdAt.
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
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

    public function getIsEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function setIsEnabled(bool $isEnabled = null): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    /**
     * @return User
     */
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

    /**
     * Get isTrashed.
     *
     * @return bool
     */
    public function getIsTrashed()
    {
        return $this->isTrashed;
    }

    public function setIsTrashed(bool $isTrashed = null): self
    {
        if ($isTrashed !== $this->isTrashed) {
            if (!$isTrashed) {
                $this->trashedReason = null;
                $this->trashedAt = null;
            }
        }
        $this->isTrashed = $isTrashed;

        return $this;
    }

    /**
     * Get trashedAt.
     *
     * @return \DateTime
     */
    public function getTrashedAt()
    {
        return $this->trashedAt;
    }

    public function setTrashedAt($trashedAt): self
    {
        $this->trashedAt = $trashedAt;

        return $this;
    }

    /**
     * Get trashedReason.
     *
     * @return string
     */
    public function getTrashedReason()
    {
        return $this->trashedReason;
    }

    public function setTrashedReason($trashedReason): self
    {
        $this->trashedReason = $trashedReason;

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

    /**
     * @return bool
     */
    public function canDisplay()
    {
        return $this->isEnabled && $this->canDisplayRelatedObject();
    }

    /**
     * @return bool
     */
    public function canContribute()
    {
        return $this->isEnabled && !$this->isTrashed && $this->canContributeToRelatedObject();
    }

    public function canVote()
    {
        return $this->isEnabled && !$this->isTrashed;
    }

    public function removeCommentFromRelatedObject()
    {
        $this->getRelatedObject()->removeComment($this);
    }

    /**
     * @return bool
     */
    public function canDisplayRelatedObject()
    {
        return $this->getRelatedObject()->canDisplay();
    }

    /**
     * @return bool
     */
    public function canContributeToRelatedObject()
    {
        return $this->getRelatedObject()->canContribute();
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

    /**
     * {@inheritdoc}
     */
    public function isIndexable()
    {
        return $this->getIsEnabled();
    }

    /**
     * {@inheritdoc}
     */
    public static function getElasticsearchTypeName()
    {
        return 'comment';
    }

    /**
     * {@inheritdoc}
     */
    public function getElasticsearchSerializationGroups()
    {
        return ['Comments'];
    }
}
