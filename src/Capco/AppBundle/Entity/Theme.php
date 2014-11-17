<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Theme
 *
 * @ORM\Table(name="theme")
 * @ORM\Entity
 */
class Theme
{

    const STATUS_CLOSED = 0;
    const STATUS_OPENED = 1;
    const STATUS_FUTURE = 2;

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255)
     */
    private $title;

    /**
     * @Gedmo\Slug(fields={"title"})
     * @ORM\Column(length=255)
     */
    private $slug;

    /**
     * @var string
     *
     * @ORM\Column(name="teaser", type="string", length=255)
     */
    private $teaser;

    /**
     * @var boolean
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled;

    /**
     * @var integer
     *
     * @ORM\Column(name="position", type="integer")
     */
    private $position;

    /**
     * @var integer
     *
     * @ORM\Column(name="status", type="integer")
     */
    private $status;

    /**
     * @var string
     *
     * @ORM\Column(name="body", type="text")
     */
    private $body;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\Consultation", cascade={"persist"})
     */
    private $Consultations;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Idea", mappedBy="Theme")
     */
    private $Ideas;

    function __construct()
    {
        $this->Consultations = new ArrayCollection();
        $this->Ideas = new ArrayCollection();
        $this->status = self::STATUS_CLOSED;
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set title
     *
     * @param string $title
     * @return Theme
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set teaser
     *
     * @param string $teaser
     * @return Theme
     */
    public function setTeaser($teaser)
    {
        $this->teaser = $teaser;

        return $this;
    }

    /**
     * Get teaser
     *
     * @return string
     */
    public function getTeaser()
    {
        return $this->teaser;
    }

    /**
     * @return boolean
     */
    public function isIsEnabled()
    {
        return $this->isEnabled;
    }

    /**
     * @param boolean $isEnabled
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;
    }

    /**
     * @return mixed
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @param mixed $position
     */
    public function setPosition($position)
    {
        $this->position = $position;
    }

    /**
     * @return int
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param int $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @return string
     */
    public function getBody()
    {
        return $this->body;
    }

    /**
     * @param string $body
     */
    public function setBody($body)
    {
        $this->body = $body;
    }

    /**
     * @param Capco\AppBundle\Entity\Consultation $Consultation
     * @return Theme
     */
    public function addConsultation(Consultation $Consultation)
    {
        $this->Consultations[] = $Consultation;

        return $this;
    }

    /**
     * @param Capco\AppBundle\Entity\Consultation $Consultation
     */
    public function removeConsultation(Consultation $Consultation)
    {
        $this->Consultations->removeElement($Consultation);
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getConsultations()
    {
        return $this->Consultations;
    }

    /**
     * @param Capco\AppBundle\Entity\Idea $Ideas
     * @return Theme
     */
    public function addIdeas(Ideas $Idea)
    {
        $this->Ideas[] = $Idea;

        return $this;
    }

    /**
     * @param Capco\AppBundle\Entity\Idea $Ideas
     */
    public function removeIdeas(Ideas $Idea)
    {
        $this->Ideas->removeElement($Idea);
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getIdeas()
    {
        return $this->Ideas;
    }

    /**
     * @return mixed
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * @param mixed $slug
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;
    }

}
