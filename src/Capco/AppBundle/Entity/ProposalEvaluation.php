<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="proposal_evaluation")
 * @ORM\Entity()
 */
class ProposalEvaluation
{
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="proposalEvaluations")
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", nullable=false)
     */
    protected $proposal;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", inversedBy="proposalEvaluations")
     * @ORM\JoinColumn(name="questionnaire_id", referencedColumnName="id", nullable=false)
     */
    protected $questionnaire;

    public function getProposal(): Proposal
    {
        return $this->proposal;
    }

    public function setProposal($proposal): self
    {
        $this->proposal = $proposal;

        return $this;
    }

    public function getQuestionnaire(): Questionnaire
    {
        return $this->questionnaire;
    }

    public function setQuestionnaire($questionnaire): self
    {
        $this->questionnaire = $questionnaire;

        return $this;
    }
}
