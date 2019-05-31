<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait PublishableTrait
{
    /**
     * @ORM\Column(name="published", type="boolean", nullable=false)
     */
    private $published = false;

    /**
     * @ORM\Column(name="publishedAt", type="datetime", nullable=true)
     */
    private $publishedAt;

    public function isPublished(): bool
    {
        return $this->published;
    }

    // We can only publish, never unpublished (= passing NULL)
    public function setPublishedAt(\DateTime $publishedAt)
    {
        $this->published = true;
        $this->publishedAt = $publishedAt;

        return $this;
    }

    public function getPublishedAt(): ?\DateTime
    {
        return $this->publishedAt;
    }

    public function getPublishableUntil(): ?\DateTime
    {
        return $this->getStep() ? $this->getStep()->getEndAt() : null;
    }
}
