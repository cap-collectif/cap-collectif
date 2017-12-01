<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Traits\HasResponsesTrait;
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
    use HasResponsesTrait;

    /**
     * @ORM\Version()
     * @ORM\Column(name="version", type="integer")
     */
    protected $version;

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

    public function getResponsesQuestions(): Collection
    {
        $proposalForm = $this->getProposal()->getProposalForm();

        return $proposalForm->getEvaluationForm() ? $proposalForm->getEvaluationForm()->getRealQuestions() : new ArrayCollection();
    }

    public function setResponseOn(AbstractResponse $response)
    {
        $response->setProposalEvaluation($this);
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

    public function getVersion()
    {
        return $this->version;
    }

    public function setVersion($version)
    {
        $this->version = $version;

        return $this;
    }
}
