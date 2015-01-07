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
     * @Gedmo\Timestampable(on="change", field={"title", "body", "Author", "OpinionType", "Consultation"})
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
    private $trashedAt = null;

    /**
     * @var string
     *
     * @ORM\Column(name="trashed_reason", type="text", nullable=true)
     */
    private $trashedReason = null;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Argument", mappedBy="opinion",  cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $arguments;

    /**
     * @var string
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionVote", mappedBy="opinion", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $Votes;

    /**
     * @var string
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="Opinion", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $Reports;

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
     * @ORM\Column(name="sources_count", type="integer")
     */
    private $sourcesCount = 0;

    /**
     * @var integer
     *
     * @ORM\Column(name="arguments_count", type="integer")
     */
    private $argumentsCount = 0;

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
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Source", mappedBy="Opinion",  cascade={"persist", "remove"}, orphanRemoval=true)
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
        $this->Reports = new ArrayCollection();
        $this->arguments = new ArrayCollection();
        $this->Sources = new ArrayCollection();
        $this->argumentsCount = 0;
        $this->sourcesCount = 0;
        $this->resetVoteCount();
        $this->updatedAt = new \Datetime;
        $this->voteCountMitige = 0;
        $this->voteCountNok = 0;
        $this->voteCountOk = 0;
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

    public function setVotes($votes){
        foreach($votes as $vote){
            $vote->setOpinion($this);
            $this->addToCount($vote->getValue());
        }
        $this->Votes = $votes;
        return $this;
    }

    /**
     * @param OpinionVote $vote
     * @return $this
     */
    public function addVote($vote)
    {
        $this->Votes->add($vote);
        $this->addToCount($vote->getValue());
        $vote->setOpinion($this);
        return $this;
    }

    /**
     * @param OpinionVote $vote
     */
    public function removeVote(OpinionVote $vote)
    {
        if($this->Votes->removeElement($vote)){
            $this->removeFromCount($vote->getValue());
            $vote->setOpinion($this);
        }
        return $this;
    }

    public function resetVotes() {
        foreach($this->Votes as $vote){
            $vote->setOpinion(null);
        }
        $this->resetVoteCount();
        $this->setVotes(new ArrayCollection());
        return $this;
    }

    public function addToCount($type) {
        if($type == OpinionVote::$voteTypes['ok']) {
            $this->voteCountOk++;
        } else if($type == OpinionVote::$voteTypes['nok']) {
            $this->voteCountNok++;
        } else if($type == OpinionVote::$voteTypes['mitige']) {
            $this->voteCountMitige++;
        }
    }

    public function removeFromCount($type) {
        if($type == OpinionVote::$voteTypes['ok']) {
            $this->voteCountOk--;
        } else if($type == OpinionVote::$voteTypes['nok']) {
            $this->voteCountNok--;
        } else if($type == OpinionVote::$voteTypes['mitige']) {
            $this->voteCountMitige--;
        }
    }

    public function resetVoteCount() {
        $this->voteCountOk = 0;
        $this->voteCountNok = 0;
        $this->voteCountMitige = 0;
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

    public function setArguments($arguments){
        $this->Consultation->removeFromArgumentCount($this->arguments->count());
        foreach($arguments as $argument){
            $argument->setOpinion($this);
        }
        $this->arguments = $arguments;
        $this->argumentsCount = $arguments->count();
        $this->Consultation->addToArgumentCount($arguments->count());
        return $this;
    }

    public function getArguments(){
        return $this->arguments;
    }

    public function resetArguments() {
        $this->Consultation->removeFromArgumentCount($this->arguments->count());
        foreach($this->arguments as $argument){
            $argument->setOpinion(null);
        }
        $this->argumentsCount = 0;
        $this->setArguments(new ArrayCollection());
        return $this;
    }

    public function addArgument($argument){
        $this->argumentsCount++;
        $this->arguments->add($argument);
        $argument->setOpinion($this);
        $this->Consultation->addToArgumentCount(1);
        return $this;
    }

    public function removeArgument($argument){
        if($this->arguments->removeElement($argument)){
            $this->argumentsCount--;
            $argument->setOpinion(null);
            $this->Consultation->removeFromArgumentCount(1);
        }
        return $this;
    }

    public function setSources($sources){
        foreach($sources as $source){
            $source->setOpinion($this);
        }
        $this->Sources = $sources;
        $this->sourcesCount = $sources->count();
        return $this;
    }

    public function getSources(){
        return $this->Sources;
    }

    public function resetSources() {
        foreach($this->Sources as $source){
            $source->setOpinion(null);
        }
        $this->sourcesCount = 0;
        $this->setSources(new ArrayCollection());
        return $this;
    }

    public function addSource($source){
        $this->sourcesCount++;
        $this->Sources->add($source);
        $source->setOpinion($this);
        return $this;
    }

    public function removeSource($source){
        if($this->Sources->removeElement($source)){
            $this->sourcesCount--;
            $source->setOpinion(null);
        }
        return $this;
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
     * @param int $argumentsCount
     */
    public function setArgumentsCount($argumentsCount)
    {
        $this->argumentsCount = $argumentsCount;
    }

    /**
     * @return int
     */
    public function getArgumentsCount()
    {
        return $this->argumentsCount;
    }

    public function increaseArgumentsCount($nb) {
        $this->argumentsCount+=$nb;
        $this->getConsultation()->increaseArgumentCount($nb);
    }

    public function decreaseArgumentsCount($nb) {
        $this->argumentsCount-=$nb;
        $this->getConsultation()->decreaseArgumentCount($nb);
    }

    /**
     * @return int
     */
    public function getSourcesCount()
    {
        return $this->sourcesCount;
    }

    /**
     * @param int $sourcesCount
     */
    public function setSourcesCount($sourcesCount)
    {
        $this->sourcesCount = $sourcesCount;
    }

    public function increaseSourcesCount($nb) {
        $this->sourcesCount+=$nb;
    }

    public function decreaseSourcesCount($nb) {
        $this->sourcesCount-=$nb;
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

    public function getVoteCountAll()
    {
        return $this->getVoteCountMitige() + $this->getVoteCountNok() + $this->getVoteCountOk();
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

    public function canDisplay() {
        return ($this->isEnabled && $this->Consultation->canDisplay());
    }

    public function canContribute()
    {
        return ($this->isEnabled && !$this->isTrashed && $this->Consultation->canContribute());
    }

    public function getBodyExcerpt($nb = 100){
        $excerpt = substr($this->body, 0, $nb);
        $excerpt = $excerpt.'...';
        return $excerpt;
    }
}
