<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * HighlightedIdea.
 *
 * @ORM\Entity()
 */
class HighlightedIdea extends HighlightedContent
{
    /**
     * @ORM\OneToOne(targetEntity="Idea")
     * @ORM\JoinColumn(name="idea_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $idea;

    /**
     * Gets the value of idea.
     *
     * @return mixed
     */
    public function getIdea()
    {
        return $this->idea;
    }

    /**
     * Sets the value of idea.
     *
     * @param mixed $idea the idea
     *
     * @return self
     */
    public function setIdea($idea)
    {
        $this->idea = $idea;

        return $this;
    }

    public function getAssociatedFeatures()
    {
        return ['ideas'];
    }

    public function getContent()
    {
        return $this->idea;
    }

    public function getType()
    {
        return 'idea';
    }

    public function getMedia()
    {
        return $this->idea->getMedia();
    }

    public function getMediaFormat()
    {
        return 'idea';
    }
}
