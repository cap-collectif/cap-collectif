<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Entity\Proposal;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class SelectionStep.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SelectionStepRepository")
 */
class SelectionStep extends AbstractStep
{
    /**
     * @var \Doctrine\Common\Collections\ArrayCollection
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="selectionSteps", cascade={"persist"})
     * @ORM\JoinTable(name="selectionstep_proposal")
     */
    private $proposals;

    /**
     * @ORM\Column(name="votable", type="boolean")
     */
    private $votable;

    /**
     * @ORM\Column(name="votes_count", type="integer")
     */
    private $votesCount = 0;

    /**
     * @ORM\Column(name="votes_help_text", type="string", nullable=true)
     */
    private $votesHelpText = null;

    public function __construct()
    {
        parent::__construct();
        $this->proposals = new ArrayCollection();
    }

    /**
     * @return mixed
     */
    public function getProposals()
    {
        return $this->proposals;
    }

    /**
     * Add proposal.
     *
     * @param Proposal $proposal
     *
     * @return Proposal
     */
    public function addProposal(Proposal $proposal)
    {
        if (!$this->proposals->contains($proposal)) {
            $this->proposals[] = $proposal;
        }

        return $this;
    }

    /**
     * Remove proposal.
     *
     * @param Proposal $proposal
     */
    public function removeProposal(Proposal $proposal)
    {
        $this->proposals->removeElement($proposal);
    }

    /**
     * @return mixed
     */
    public function isVotable()
    {
        return $this->votable;
    }

    /**
     * @param mixed $votable
     */
    public function setVotable($votable)
    {
        $this->votable = $votable;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getVotesCount()
    {
        return $this->votesCount;
    }

    /**
     * @param mixed $votesCount
     *
     * @return $this
     */
    public function setVotesCount($votesCount)
    {
        $this->votesCount = $votesCount;

        return $this;
    }

    public function incrementVotesCount()
    {
        ++$this->votesCount;

        return $this;
    }

    public function decrementVotesCount()
    {
        --$this->votesCount;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getVotesHelpText()
    {
        return $this->votesHelpText;
    }

    /**
     * @param mixed $votesHelpText
     * @return $this
     */
    public function setVotesHelpText($votesHelpText)
    {
        $this->votesHelpText = $votesHelpText;

        return $this;
    }

    // **************************** Custom methods *******************************

    public function getType()
    {
        return 'selection';
    }

    public function isSelectionStep()
    {
        return true;
    }
}
