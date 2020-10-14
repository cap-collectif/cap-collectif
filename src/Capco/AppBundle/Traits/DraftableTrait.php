<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait DraftableTrait
{
    /**
     * @ORM\Column(name="is_draft", type="boolean", nullable=false)
     */
    private bool $draft = false;

    /**
     * @ORM\Column(name="undraft_at", type="datetime", nullable=true)
     */
    private ?\DateTime $undraftAt = null;

    public function isDraft(): bool
    {
        return $this->draft;
    }

    public function setDraft(bool $draft): self
    {
        if ($this->draft && !$draft) {
            $this->undraft();
        } elseif (!$this->draft && $draft) {
            $this->draft();
        }

        return $this;
    }

    public function getUndraftAt(): ?\DateTime
    {
        return $this->undraftAt;
    }

    public function setUndraftAt(?\DateTime $undraftAt): self
    {
        $this->undraftAt = $undraftAt;

        return $this;
    }

    private function undraft(): self
    {
        $this->draft = false;
        $this->undraftAt = new \DateTime();

        return $this;
    }

    private function draft(): self
    {
        $this->draft = true;
        $this->undraftAt = null;

        return $this;
    }
}
