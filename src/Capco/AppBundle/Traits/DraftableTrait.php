<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait DraftableTrait
{
    /**
     * @ORM\Column(name="draft", type="boolean", nullable=false)
     */
    private $draft = false;

    public function isDraft(): bool
    {
        return $this->draft;
    }

    public function setDraft(bool $draft): self
    {
        $this->draft = $draft;

        return $this;
    }
}
