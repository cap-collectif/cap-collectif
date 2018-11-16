<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait SummarizableTrait
{
    /**
     * @Assert\Length(max = 140, min = 2)
     * @ORM\Column(name="summary", type="string", nullable=true)
     */
    private $summary;

    public function getSummary(): ?string
    {
        return $this->summary;
    }

    public function getProposalSummaryOrBodyExcerpt(): ?string
    {
        /** @var ProposalForm $proposalForm */
        $proposalForm = $this->getProposalForm();
        if (!$proposalForm) {
            return null;
        }

        if (
            $proposalForm->getUsingSummary() &&
            $proposalForm->getUsingDescription() &&
            $proposalForm->getDescriptionMandatory()
        ) {
            return $this->getBodyTextExcerpt(140);
        }

        if (
            $proposalForm->getUsingSummary() &&
            $proposalForm->getUsingDescription() &&
            !$proposalForm->getDescriptionMandatory()
        ) {
            return $this->summary ?? $this->getBodyTextExcerpt(140);
        }

        if (!$proposalForm->getUsingSummary() && !$proposalForm->getUsingDescription()) {
            return null;
        }

        if ($proposalForm->getUsingSummary() && !$proposalForm->getUsingDescription()) {
            return $this->summary ? $this->summary : null;
        }

        if (!$proposalForm->getUsingSummary() && $proposalForm->getUsingDescription()) {
            return $this->getBodyTextExcerpt(140);
        }

        return $this->summary ?? $this->getBodyTextExcerpt(140);
    }

    public function getSummaryOrBodyExcerpt(): ?string
    {
        if ($this instanceof Proposal) {
            return $this->getProposalSummaryOrBodyExcerpt();
        }

        return $this->summary ?? $this->getBodyTextExcerpt(140);
    }

    public function setSummary(?string $summary = null): self
    {
        $this->summary = $summary;

        return $this;
    }
}
