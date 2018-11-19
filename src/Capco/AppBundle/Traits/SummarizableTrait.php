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

    public function getSummary()
    {
        return $this->summary;
    }

    public function getSummaryOrBodyExcerpt(): string
    {
        return $this->summary ?? $this->getBodyTextExcerpt(140);
    }

    public function setSummary(string $summary = null): self
    {
        $this->summary = $summary;

        return $this;
    }
}
