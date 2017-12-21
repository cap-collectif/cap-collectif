<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="proposal_evaluation")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalEvaluationRepository")
 */
class ProposalEvaluation
{
    use UuidTrait;
    use TimestampableTrait;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="proposalEvaluation")
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", nullable=false)
     */
    protected $proposal;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Responses\AbstractResponse", mappedBy="proposalEvaluation", cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $responses;

    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private $updatedAt;

    public function __construct()
    {
        $this->responses = new ArrayCollection();
    }

    public function addResponse(AbstractResponse $response): self
    {
        if (!$this->responses->contains($response)) {
            $this->responses->add($response);
            $response->setProposalEvaluation($this);
        }

        return $this;
    }

    public function removeResponse(AbstractResponse $response): self
    {
        $this->responses->removeElement($response);

        return $this;
    }

    public function getResponses(): Collection
    {
        return $this->responses;
    }

    public function setResponses(Collection $responses): self
    {
        $this->responses = $responses;
        foreach ($responses as $response) {
            $response->setProposalEvaluation($this);
        }

        return $this;
    }

    public function getProposal()// : Proposal
    {
        return $this->proposal;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;

        return $this;
    }
}
