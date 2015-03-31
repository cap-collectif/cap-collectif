<?php

namespace Capco\AppBundle\Entity;

use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Source.
 *
 * @ORM\Table(name="source")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SourceRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Source
{
    const TYPE_FOR  = 1;
    const LINK = 0;
    const FILE = 1;

    public static $TypesLabels = [
        self::LINK => 'source.type.link',
        self::FILE => 'source.type.file',
    ];

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=100)
     * @Assert\NotBlank()
     */
    private $title;

    /**
     * @Gedmo\Slug(fields={"title"})
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column(name="link", type="text", length=255, nullable=true)
     * @Assert\NotBlank(groups={"link"})
     * @Assert\Url(groups={"link"})
     */
    private $link;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text")
     * @Assert\NotBlank()
     */
    private $body;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "link", "body", "Author", "Opinion", "Category", "Media", "type"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @var string
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="sources")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $Author;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="Sources", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $Opinion;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Category", inversedBy="Sources", cascade={"persist"})
     * @ORM\JoinColumn(name="category_id", referencedColumnName="id", nullable=false)
     */
    private $Category;

    /**
     * @var
     *
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true)
     * @Assert\NotBlank(groups={"file"})
     * @Assert\Valid()
     */
    private $Media;

    /**
     * @var int
     *
     * @ORM\Column(name="type", type="integer")
     */
    private $type;

    /**
     * @var
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\SourceVote", mappedBy="source", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $votes;

    /**
     * @var
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="Source", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $Reports;

    /**
     * @var int
     *
     * @ORM\Column(name="vote_count_source", type="integer")
     */
    private $voteCount = 0;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_trashed", type="boolean")
     */
    private $isTrashed = false;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"isTrashed"})
     * @ORM\Column(name="trashed_at", type="datetime", nullable=true)
     */
    private $trashedAt = null;

    /**
     * @var string
     *
     * @ORM\Column(name="trashed_reason", type="text", nullable=true)
     */
    private $trashedReason = null;

    public function __construct()
    {
        $this->type = self::LINK;
        $this->Reports = new ArrayCollection();
        $this->votes = new ArrayCollection();
        $this->voteCount = 0;
        $this->updatedAt = new \DateTime();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return 'New source';
        }
    }

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get title.
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set title.
     *
     * @param string $title
     *
     * @return Source
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * @param mixed $slug
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;
    }

    /**
     * Get link.
     *
     * @return string
     */
    public function getLink()
    {
        return $this->link;
    }

    /**
     * Set link.
     *
     * @param string $link
     *
     * @return Source
     */
    public function setLink($link)
    {
        $this->link = $link;

        return $this;
    }

    /**
     * Get body.
     *
     * @return string
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * Set body.
     *
     * @param string $body
     *
     * @return Source
     */
    public function setBody($body)
    {
        $this->body = $body;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * Get isEnabled.
     *
     * @return bool
     */
    public function getIsEnabled()
    {
        return $this->isEnabled;
    }

    /**
     * Set isEnabled.
     *
     * @param bool $isEnabled
     *
     * @return Source
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getAuthor()
    {
        return $this->Author;
    }

    /**
     * @param mixed $Author
     */
    public function setAuthor($Author)
    {
        $this->Author = $Author;
    }

    /**
     * @return mixed
     */
    public function getOpinion()
    {
        return $this->Opinion;
    }

    /**
     * @param mixed $Opinion
     *
     * @return $this
     */
    public function setOpinion($Opinion)
    {
        $this->Opinion = $Opinion;
        $this->Opinion->addSource($this);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getCategory()
    {
        return $this->Category;
    }

    /**
     * @param mixed $Category
     *
     * @return $this
     */
    public function setCategory($Category)
    {
        $this->Category = $Category;
        $this->Category->addSource($this);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getMedia()
    {
        return $this->Media;
    }

    /**
     * @param mixed $Media
     */
    public function setMedia($Media)
    {
        $this->Media = $Media;
    }

    /**
     * @return mixed
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param mixed $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }

    /**
     * @return mixed
     */
    public function getVotes()
    {
        return $this->votes;
    }

    /**
     * @param $vote
     *
     * @return $this
     */
    public function addVote($vote)
    {
        if (!$this->votes->contains($vote)) {
            $this->votes->add($vote);
        }

        return $this;
    }

    /**
     * @param $vote
     *
     * @return $this
     */
    public function removeVote($vote)
    {
        $this->votes->removeElement($vote);

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
     * @return int
     */
    public function getVoteCount()
    {
        return $this->voteCount;
    }

    /**
     * @param int $voteCount
     */
    public function setVoteCount($voteCount)
    {
        $this->voteCount = $voteCount;
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

    /**
     * Set isTrashed.
     *
     * @param bool $isTrashed
     *
     * @return Source
     */
    public function setIsTrashed($isTrashed)
    {
        if ($isTrashed != $this->isTrashed) {
            if (false == $this->isTrashed) {
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

    /**
     * Set trashedAt.
     *
     * @param \DateTime $trashedAt
     *
     * @return Source
     */
    public function setTrashedAt($trashedAt)
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

    /**
     * Set trashedReason.
     *
     * @param string $trashedReason
     *
     * @return Source
     */
    public function setTrashedReason($trashedReason)
    {
        $this->trashedReason = $trashedReason;

        return $this;
    }

    // *************************** custom methods *******************************

    /**
     * @return $this
     */
    public function resetVotes()
    {
        foreach ($this->votes as $vote) {
            $vote->setConfirmed(false);
        }

        return $this;
    }

    /**
     * @param User $user
     *
     * @return bool
     */
    public function userHasVote(User $user = null)
    {
        if ($user != null) {
            foreach ($this->votes as $vote) {
                if ($vote->getUser() == $user) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * @param User $user
     *
     * @return bool
     */
    public function userHasReport(User $user = null)
    {
        if ($user != null) {
            foreach ($this->Reports as $report) {
                if ($report->getReporter() == $user) {
                    return true;
                }
            }
        }

        return false;
    }

    public function canDisplay()
    {
        return $this->isEnabled && $this->Opinion->canDisplay();
    }

    public function canContribute()
    {
        return $this->isEnabled && !$this->isTrashed && $this->Opinion->canContribute();
    }

    // ******************** Lifecycle ************************************

    /**
     * @ORM\PreRemove
     */
    public function deleteSource()
    {
        if ($this->Category != null) {
            $this->Category->removeSource($this);
        }
        if ($this->Opinion != null) {
            $this->Opinion->removeSource($this);
        }
    }
}
