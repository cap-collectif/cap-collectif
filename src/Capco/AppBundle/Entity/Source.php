<?php

namespace Capco\AppBundle\Entity;

use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Source
 *
 * @ORM\Table(name="source")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SourceRepository")
 */
class Source
{
    const TYPE_FOR  = 1;
    const LINK = 0;
    const FILE = 1;

    public static $TypesLabels = [
        self::LINK => 'source.type.link',
        self::FILE => 'source.type.file'
    ];

    /**
     * @var integer
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
     * @var boolean
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @var string
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", nullable=false)
     */
    private $Author;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="Sources")
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", nullable=false)
     */
    private $Opinion;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Category", inversedBy="Sources")
     * @ORM\JoinColumn(name="category_id", referencedColumnName="id", nullable=false)
     */
    private $Category;

    /**
     * @var
     *
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", fetch="LAZY", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true)
     * @Assert\NotBlank(groups={"file"})
     */
    private $Media;

    /**
     * @var integer
     *
     * @ORM\Column(name="type", type="integer")
     */
    private $type;

    /**
     * @var
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\SourceVote", mappedBy="source", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $Votes;

    /**
     * @var string
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="Source", cascade={"persist", "remove"})
     */
    private $Reports;

    /**
     * @var integer
     *
     * @ORM\Column(name="vote_count_source", type="integer")
     */
    private $voteCountSource = 0;

    /**
     * @var boolean
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

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New source";
        }

    }

    function __construct()
    {
        $this->type = self::LINK;
        $this->Reports = new ArrayCollection();
        $this->voteCountSource = 0;
        $this->updatedAt = new \DateTime;
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set title
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
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set link
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
     * Get link
     *
     * @return string
     */
    public function getLink()
    {
        return $this->link;
    }

    /**
     * Set body
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
     * Get body
     *
     * @return string
     */
    public function getBody()
    {
        return $this->body;
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
     * @return mixed
     */
    public function getOpinion()
    {
        return $this->Opinion;
    }

    /**
     * @param mixed $Opinion
     */
    public function setOpinion($Opinion)
    {
        $this->Opinion = $Opinion;
    }

    /**
     * @return int
     */
    public function getVoteCountSource()
    {
        return $this->voteCountSource;
    }

    /**
     * @param int $voteCountSource
     */
    public function setVoteCountSource($voteCountSource)
    {
        $this->voteCountSource = $voteCountSource;
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
     * @return mixed
     */
    public function getCategory()
    {
        return $this->Category;
    }

    /**
     * @param mixed $Category
     */
    public function setCategory($Category)
    {
        $this->Category = $Category;
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
     * Set isTrashed
     *
     * @param boolean $isTrashed
     * @return Source
     */
    public function setIsTrashed($isTrashed)
    {
        if ($isTrashed != $this->isTrashed) {
            if($this->isEnabled) {
                if ($isTrashed) {
                    $this->Opinion->decreaseSourcesCount(1);
                } else {
                    $this->Opinion->increaseSourcesCount(1);
                }
            }
        }
        $this->isTrashed = $isTrashed;
        return $this;
    }

    /**
     * Get isTrashed
     *
     * @return boolean
     */
    public function getIsTrashed()
    {
        return $this->isTrashed;
    }

    /**
     * Set trashedAt
     *
     * @param \DateTime $trashedAt
     * @return Source
     */
    public function setTrashedAt($trashedAt)
    {
        $this->trashedAt = $trashedAt;

        return $this;
    }

    /**
     * Get trashedAt
     *
     * @return \DateTime
     */
    public function getTrashedAt()
    {
        return $this->trashedAt;
    }

    /**
     * Set trashedReason
     *
     * @param string $trashedReason
     * @return Source
     */
    public function setTrashedReason($trashedReason)
    {
        $this->trashedReason = $trashedReason;

        return $this;
    }

    /**
     * Get trashedReason
     *
     * @return string
     */
    public function getTrashedReason()
    {
        return $this->trashedReason;
    }

    public function setVotes($votes){
        foreach($votes as $vote){
            $vote->setSource($this);
        }
        $this->Votes = $votes;
        $this->voteCountSource = $votes->count();
        return $this;
    }

    public function resetVotes() {
        foreach($this->Votes as $vote){
            $vote->setSource(null);
        }
        $this->voteCountSource = 0;
        $this->setVotes(new ArrayCollection());
        return $this;
    }

    public function addVote($vote){
        $this->voteCountSource++;
        $this->Votes->add($vote);
        $vote->setSource($this);
        return $this;
    }

    public function removeVote($vote){
        if($this->Votes->removeElement($vote)){
            $this->voteCountSource--;
            $vote->setSource(null);
        }
        return $this;
    }

    public function getVotes(){
        return $this->Votes;
    }

    public function userHasVote(User $user = null){
        if ($user != null) {
            foreach($this->Votes as $vote) {
                if ($vote->getVoter() == $user) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     *
     * @return string
     */
    public function getReports()
    {
        return $this->Reports;
    }

    /**
     * @param Reporting $report
     * @return $this
     */
    public function addReport(Reporting $report)
    {
        $this->Reports[] = $report;

        return $this;
    }

    /**
     * @param Reporting $report
     */
    public function removeReport(Reporting $report)
    {
        $this->Reports->removeElement($report);
    }

    /**
     * Set isEnabled
     *
     * @param boolean $isEnabled
     * @return Source
     */
    public function setIsEnabled($isEnabled)
    {
        if ($isEnabled != $this->isEnabled) {
            if($isEnabled) {
                if(!$this->isTrashed) {
                    $this->Opinion->increaseSourcesCount(1);
                }
            } else {
                if(!$this->isTrashed) {
                    $this->Opinion->decreaseSourcesCount(1);
                }
            }
        }
        $this->isEnabled = $isEnabled;
        return $this;
        return $this;
    }

    /**
     * Get isEnabled
     *
     * @return boolean
     */
    public function getIsEnabled()
    {
        return $this->isEnabled;
    }

    public function canDisplay() {
        return ($this->isEnabled && $this->Opinion->canDisplay());
    }

    public function canContribute() {
        return ($this->isEnabled && !$this->isTrashed && $this->Opinion->canContribute());
    }

}

