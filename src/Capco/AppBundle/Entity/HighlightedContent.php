<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * HighlightedContent.
 *
 * @ORM\Table(name="highlighted_content")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\HighlightedContentRepository")
 * @ORM\InheritanceType("SINGLE_TABLE")
 * @ORM\DiscriminatorColumn(name = "object_type", type = "string")
 * @ORM\DiscriminatorMap({
 *  "post" = "HighlightedPost",
 *  "theme" = "HighlightedTheme",
 *  "consultation" = "HighlightedConsultation",
 *  "idea" = "HighlightedIdea",
 *  "event" = "HighlightedEvent"
 * })
 */
abstract class HighlightedContent
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(name="position", type="integer")
     */
    private $position;

    abstract public function getMedia();
    abstract public function getType();

    public function getAssociatedFeatures()
    {
        return [];
    }

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

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
