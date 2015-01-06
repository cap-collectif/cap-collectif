<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Opinion
 *
 * @ORM\Table(name="opinion")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionRepository")
 */
class Opinion
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
    private $isEnabled = true;

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
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Argument", mappedBy="opinion",  cascade={"persist", "remove"})
     */
    private $arguments;

    /**
     * @var string
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionVote", mappedBy="opinion", cascade={"persist", "remove"})
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
     * @var integer
     *
     * @ORM\Column(name="source_count", type="integer")
     */
    private $sourceCount = 0;

    /**
     * @var string
     *
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id")
     */
    private $Author;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OpinionType", inversedBy="Opinions")
     * @ORM\JoinColumn(name="opinion_type_id", referencedColumnName="id", nullable=false)
     */
    private $OpinionType;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Consultation", inversedBy="Opinions")
     */
    private $Consultation;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Source", mappedBy="Opinion",  cascade={"persist", "remove"})
     */
    private $Sources;

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New opinion";
        }

    }

    /**
     * @return mixed
     */
    public function getOpinionType()
    {
        return $this->OpinionType;
    }

    /**
     * @param mixed $OpinionType
     */
    public function setOpinionType($OpinionType)
    {
        $this->OpinionType = $OpinionType;
    }


    /**
     * @return mixed
     */
    public function getConsultation()
    {
        return $this->Consultation;
    }

    /**
     * @param mixed $Consultation
     */
    public function setConsultation($Consultation)
    {
        $this->Consultation = $Consultation;
    }


    function __construct()
    {
        $this->Votes = new ArrayCollection();
        $this->arguments = new ArrayCollection();
        $this->Sources = new ArrayCollection();
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
     * @return Opinion
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
     * @return Opinion
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
     * @return Opinion
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
     * @return Opinion
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
     * @return Opinion
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
     * @return Opinion
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
     * @return Opinion
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
     * @param OpinionVote $vote
     * @return $this
     */
    public function addVote(OpinionVote $vote)
    {
        $this->Votes[] = $vote;

        return $this;
    }

    /**
     * @param OpinionVote $vote
     */
    public function removeVote(OpinionVote $vote)
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
     * @return mixed
     */
    public function getSources()
    {
        return $this->Sources;
    }

    /**
     * @param Source $source
     * @return $this
     */
    public function addSource(Source $source)
    {
        $this->Sources[] = $source;

        return $this;
    }

    /**
     * @param Source $source
     */
    public function removeSource(Source $source)
    {
        $this->Sources->removeElement($source);
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
     * @return int
     */
    public function getSourceCount()
    {
        return $this->sourceCount;
    }

    /**
     * @param int $sourceCount
     */
    public function setSourceCount($sourceCount)
    {
        $this->sourceCount = $sourceCount;
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

    public function resetVotes(){
        $this->voteCountMitige = 0;
        $this->voteCountOk = 0;
        $this->voteCountNok = 0;
        return $this;
    }

    /**
     * Add vote
     *
     * @param type
     *
     * @return Opinion
     */
    public function addVoteWithType($type)
    {
        if($type == OpinionVote::VOTE_MITIGE){
            $this->voteCountMitige++;
        }
        else if($type == OpinionVote::VOTE_NOK){
            $this->voteCountNok++;
        }
        else if($type == OpinionVote::VOTE_OK){
            $this->voteCountOk++;
        }

        return $this;
    }

    /**
     * Remove vote
     *
     * @param type
     *
     * @return Opinion
     */
    public function removeVoteWithType($type)
    {
        if($type == OpinionVote::VOTE_MITIGE){
            $this->voteCountMitige--;
        }
        else if($type == OpinionVote::VOTE_NOK){
            $this->voteCountNok--;
        }
        else if($type == OpinionVote::VOTE_OK){
            $this->voteCountOk--;
        }

        return $this;
    }

}
