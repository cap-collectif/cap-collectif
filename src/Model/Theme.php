<?php

namespace Model;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Theme
 *
 * @ORM\Table()
 * @ORM\Entity
 */
class Theme
{
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
     * @ORM\Column(name="title", type="string", length=100)
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="teaser", type="string", length=255)
     */
    private $teaser;

    /**
     * @var boolean
     *
     * @ORM\Column(name="enabled", type="boolean")
     */
    private $enabled;

    /**
     * @var string
     *
     * @ORM\Column(name="content", type="text")
     */
    private $content;

    /**
     * @ORM\OneToOne(targetEntity="Model\Media", cascade={"persist", "remove"})
     */
    private $image;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Model\Consultation", cascade={"persist"})
     */
    private $consultations;

    function __construct()
    {
        $this->consultations = new ArrayCollection();
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
     * Set enabled
     *
     * @param boolean $enabled
     * @return Theme
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;

        return $this;
    }

    /**
     * Get enabled
     *
     * @return boolean 
     */
    public function getEnabled()
    {
        return $this->enabled;
    }

    /**
     * Set content
     *
     * @param string $content
     * @return Theme
     */
    public function setContent($content)
    {
        $this->content = $content;

        return $this;
    }

    /**
     * Get content
     *
     * @return string 
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * @param \Model\Consultation $consultation
     * @return Theme
     */
    public function addConsultation(Consultation $consultation)
    {
        $this->consultations[] = $consultation;

        return $this;
    }

    /**
     * @param \Model\Consultation $consultation
     */
    public function removeConsultation(Consultation $consultation)
    {
        $this->consultations->removeElement($consultation);
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getConsultations()
    {
        return $this->consultations;
    }

    /**
     * @param \Model\Media $image
     * @return Theme
     */
    public function setImage(\Model\Media $image = null)
    {
        $this->image = $image;
        return $this;
    }

    /**
     * @return \Model\Media
     */
    public function getImage()
    {
        return $this->image;
    }
}
