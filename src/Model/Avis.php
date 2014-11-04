<?php

namespace Model;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Avis
 *
 * @ORM\Table()
 * @ORM\Entity
 */
class Avis
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
     * @ORM\Column(name="content", type="text")
     */
    private $content;

    /**
     * @ORM\ManyToOne(targetEntity="Model\Consultation", inversedBy="avis")
     * @ORM\JoinColumn(nullable=false)
     */
    private $consultation;

    /**
     * @ORM\ManyToOne(targetEntity="Model\Type", inversedBy="allAvis")
     * @ORM\JoinColumn(nullable=false)
     */
    private $type;

    /**
     * @ORM\OneToMany(targetEntity="Model\Source", mappedBy="avis",  cascade={"persist", "remove"})
     */
    private $sourcesAvis;

    public function __construct()
    {
        $this->sourcesAvis = new ArrayCollection();
    }

    /**
     * @return mixed
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param mixed $type
     */
    public function setType($type)
    {
        $this->type = $type;
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
     * @return Avis
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
     * Set content
     *
     * @param string $content
     * @return Avis
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
     * @return mixed
     */
    public function getConsultation()
    {
        return $this->consultation;
    }

    /**
     * @param mixed $consultation
     */
    public function setConsultation($consultation)
    {
        $this->consultation = $consultation;
    }

    /**
     * @param \Model\Source $source
     * @return Avis
     */
    public function addSourceAvis(Source $source)
    {
        $this->sourcesAvis[] = $source;

        return $this;
    }

    /**
     * @param \Model\Source $source
     */
    public function removeSourceAvis(Source $source)
    {
        $this->sourcesAvis->removeElement($source);
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getSourcesAvis()
    {
        return $this->sourcesAvis;
    }
}
