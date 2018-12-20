<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\IdTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="highlighted_content")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\HighlightedContentRepository")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "object_type", type = "string")
 * @ORM\DiscriminatorMap({
 *  "post"    = "HighlightedPost",
 *  "theme"   = "HighlightedTheme",
 *  "project" = "HighlightedProject",
 *  "event"   = "HighlightedEvent"
 * })
 */
abstract class HighlightedContent
{
    use IdTrait;

    /**
     * @ORM\Column(name="position", type="integer")
     */
    private $position;

    abstract public function getMedia();

    abstract public function getType();

    abstract public function getAssociatedFeatures();

    /**
     * Get position.
     *
     * @return int
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * Sets the value of position.
     *
     * @param mixed $position the position
     *
     * @return self
     */
    public function setPosition($position)
    {
        $this->position = $position;

        return $this;
    }
}
