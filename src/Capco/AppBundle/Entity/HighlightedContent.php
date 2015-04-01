<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

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

    /**
     * @ORM\OneToOne(targetEntity="Post")
     */
     private $post;

    /**
     * @ORM\OneToOne(targetEntity="Theme")
     */
     private $theme;

    /**
     * @ORM\OneToOne(targetEntity="Consultation")
     */
     private $consultation;

    /**
     * @ORM\OneToOne(targetEntity="Idea")
     */
     private $idea;

    /**
     * @ORM\OneToOne(targetEntity="Event")
     */
     private $event;

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
     * @return integer
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * Sets the value of id.
     *
     * @param int $id the id
     *
     * @return self
     */
    private function setId($id)
    {
        $this->id = $id;

        return $this;
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

    /**
     * Gets the value of post.
     *
     * @return mixed
     */
    public function getPost()
    {
        return $this->post;
    }

    /**
     * Sets the value of post.
     *
     * @param mixed $post the post
     *
     * @return self
     */
    public function setPost($post)
    {
        $this->post = $post;

        return $this;
    }

    /**
     * Gets the value of theme.
     *
     * @return mixed
     */
    public function getTheme()
    {
        return $this->theme;
    }

    /**
     * Sets the value of theme.
     *
     * @param mixed $theme the theme
     *
     * @return self
     */
    public function setTheme($theme)
    {
        $this->theme = $theme;

        return $this;
    }

    /**
     * Gets the value of consultation.
     *
     * @return mixed
     */
    public function getConsultation()
    {
        return $this->consultation;
    }

    /**
     * Sets the value of consultation.
     *
     * @param mixed $consultation the consultation
     *
     * @return self
     */
    public function setConsultation($consultation)
    {
        $this->consultation = $consultation;

        return $this;
    }

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

    /**
     * Gets the value of event.
     *
     * @return mixed
     */
    public function getEvent()
    {
        return $this->event;
    }

    /**
     * Sets the value of event.
     *
     * @param mixed $event the event
     *
     * @return self
     */
    public function setEvent($event)
    {
        $this->event = $event;

        return $this;
    }
}
