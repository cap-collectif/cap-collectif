<?php

namespace Capco\AppBundle\Traits;

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

    public function getProposalFormSummaryOrBodyExcerpt(): ?string
    {
        if (!($proposalForm = $this->getProposalForm())) {
            return null;
        }

        if (!$proposalForm->getSummaryMandatory()) {
            return $this->summary ?? $this->getBodyTextExcerpt(140);
        }

        if (!$proposalForm->usingSumary() && !$proposalForm->usingDescription()) {
            return null;
        }

        if (
            $proposalForm->getUsingSummary() &&
            !$proposalForm->getSummaryMandatory() &&
            !$proposalForm->usingDescription()
        ) {
            return $this->summary ? $this->summary : null;
        }

        if (!$proposalForm->getUsingSummary() && $proposalForm->getUsingDescription()) {
            return $this->getBodyTextExcerpt(140);
        }

        return $this->summary ?? $this->getBodyTextExcerpt(140);
    }

    public function getSummaryOrBodyExcerpt(): ?string
    {
        if (property_exists($this, 'getProposalForm')) {
            return $this->getProposalFormSummaryOrBodyExcerpt();
        }

        return $this->summary ?? $this->getBodyTextExcerpt(140);
    }

    public function setSummary(?string $summary = null): self
    {
        $this->summary = $summary;

        return $this;
    }
}
