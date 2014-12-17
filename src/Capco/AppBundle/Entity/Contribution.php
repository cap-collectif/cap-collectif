<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Contribution
 *
 * @ORM\Table(name="contribution")
 * @ORM\Entity
 * @ORM\InheritanceType("JOINED")
 * @ORM\DiscriminatorColumn(name="type", type="string")
 * @ORM\DiscriminatorMap({"opinion" = "Opinion", "problem" = "Problem"})
 */
class Contribution
{
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
     * @ORM\Column(name="title", type="string", length=255)
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
     * @ORM\Column(name="body", type="text")
     */
    private $body;

    /**
     * @var boolean
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

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
    private $trashedAt;

    /**
     * @var string
     *
     * @ORM\Column(name="trashed_reason", type="text", nullable=true)
     */
    private $trashedReason;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Argument", mappedBy="contribution",  cascade={"persist", "remove"})
     */
    private $arguments;

    /**
     * @var string
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Vote", mappedBy="Contribution")
     */
    private $Votes;

    /**
     * @var integer
     *
     * @ORM\Column(name="vote_count_nok", type="integer")
     */
    private $voteCountNok = 0;

    /**
     * @var integer
     *
     * @ORM\Column(name="vote_count_ok", type="integer")
     */
    private $voteCountOk = 0;

    /**
     * @var integer
     *
     * @ORM\Column(name="vote_count_mitige", type="integer")
     */
    private $voteCountMitige = 0;

    /**
     * @var string
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id")
     */
    private $Author;

    function __construct()
    {
        $this->Votes = new ArrayCollection();
        $this->arguments = new ArrayCollection();
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
     * @return Contribution
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
     * Set slug
     *
     * @param string $slug
     * @return Contribution
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Get slug
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * Set body
     *
     * @param string $body
     * @return Contribution
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
     * Set isEnabled
     *
     * @param boolean $isEnabled
     * @return Contribution
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;

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

    /**
     * Get createdAt
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Get updatedAt
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * Set isTrashed
     *
     * @param boolean $isTrashed
     * @return Contribution
     */
    public function setIsTrashed($isTrashed)
    {
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
     * @return Contribution
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
     * @return Contribution
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

    /**
     * Get votes
     *
     * @return string
     */
    public function getVotes()
    {
        return $this->Votes;
    }

    /**
     * @param Vote $vote
     * @return $this
     */
    public function addVote(Vote $vote)
    {
        $this->Votes[] = $vote;

        return $this;
    }

    /**
     * @param Vote $vote
     */
    public function removeVote(Vote $vote)
    {
        $this->Votes->removeElement($vote);
    }

    /**
     * @return mixed
     */
    public function getArguments()
    {
        return $this->arguments;
    }

    /**
     * @param Argument $argument
     * @return $this
     */
    public function addArgument(Argument $argument)
    {
        $this->arguments[] = $argument;

        return $this;
    }

    /**
     * @param Argument $argument
     */
    public function removeArgument(Argument $argument)
    {
        $this->arguments->removeElement($argument);
    }

    /**
     * @return string
     */
    public function getAuthor()
    {
        return $this->Author;
    }

    /**
     * @param string $Author
     */
    public function setAuthor($Author)
    {
        $this->Author = $Author;
    }



    /**
     * Set createdAt
     *
     * @param \DateTime $createdAt
     *
     * @return Contribution
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Set updatedAt
     *
     * @param \DateTime $updatedAt
     *
     * @return Contribution
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * @return int
     */
    public function getVoteCountNok()
    {
        return $this->voteCountNok;
    }

    /**
     * @param int $voteCountNok
     */
    public function setVoteCountNok($voteCountNok)
    {
        $this->voteCountNok = $voteCountNok;
    }

    /**
     * @return int
     */
    public function getVoteCountOk()
    {
        return $this->voteCountOk;
    }

    /**
     * @param int $voteCountOk
     */
    public function setVoteCountOk($voteCountOk)
    {
        $this->voteCountOk = $voteCountOk;
    }

    /**
     * @return int
     */
    public function getVoteCountMitige()
    {
        return $this->voteCountMitige;
    }

    /**
     * @param int $voteCountMitige
     */
    public function setVoteCountMitige($voteCountMitige)
    {
        $this->voteCountMitige = $voteCountMitige;
    }

    public function getVotesAll()
    {
        return $this->getVoteCountMitige() + $this->getVoteCountNok() + $this->getVoteCountOk();
    }

}
