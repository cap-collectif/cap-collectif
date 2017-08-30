<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait SummarizableTrait
{
    /**
     * @ORM\Column(name="summary", type="string", nullable=true)
     */
    private $summary;

    public function getSummary()
    {
        return $this->summary;
    }

    public function getSummaryOrBodyExcerpt()
    {
        return $this->summary ?? $this->getBodyTextExcerpt(140);
    }

    public function setSummary(string $summary = null): self
    {
        $this->summary = $summary;

        return $this;
    }
}
