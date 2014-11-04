<?php

namespace Model;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * Category
 *
 * @ORM\Table()
 * @ORM\Entity
 */
class Category
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
     * @Gedmo\Slug(fields={"title"})
     * @ORM\Column(length=75)
     */
    private $slug;

    /**
     * @ORM\OneToMany(targetEntity="Model\Source", mappedBy="category", cascade={"persist", "remove"})
     */
    private $sourcesCat;

    function __construct()
    {
        $this->sourcesCat = new ArrayCollection();

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
     * @return Category
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
     * Set slug
     *
     * @param string $slug
     * @return Category
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Get slug
     *
     * @return string
     */
    public function getSlug()
    {
        return $this->slug;
    }

    /**
     * @param \Model\Source $sources
     * @return Category
     */
    public function addSourcesCat(\Model\Source $sources)
    {
        $this->sourcesCat[] = $sources;

        return $this;
    }

    /**
     * @param \Model\Source $sources
     */
    public function removeSourceCat(\Model\Source $sources)
    {
        $this->sourcesCat->removeElement($sources);
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getSourcesCat()
    {
        return $this->sourcesCat;
    }
}
