<?php

namespace Model;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Type
 *
 * @ORM\Table()
 * @ORM\Entity
 */
class Type
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
     * @ORM\Column(name="title", type="string", length=75)
     */
    private $title;

    /**
     * @var integer
     *
     * @ORM\Column(name="weight", type="smallint")
     */
    private $weight;

    /**
     * @Gedmo\Slug(fields={"title"})
     * @ORM\Column(length=75)
     */
    private $slug;

    /**
     * @var \datetime $update
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(type="datetime")
     */
    private $created;

    /**
     * @var \datetime $updated
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime")
     */
    private $updated;

    /**
     * @ORM\OneToMany(targetEntity="Model\Avis", mappedBy="type",  cascade={"persist", "remove"})
     */
    private $allAvis;

    public function __construct()
    {
        $this->allAvis = new ArrayCollection();
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
     * @return Type
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
     * @return Type
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
     * Set weight
     *
     * @param integer $weight
     * @return Type
     */
    public function setWeight($weight)
    {
        $this->weight = $weight;

        return $this;
    }

    /**
     * Get weight
     *
     * @return integer
     */
    public function getWeight()
    {
        return $this->weight;
    }

    /**
     * @return \datetime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @return \datetime
     */
    public function getUpdated()
    {
        return $this->updated;
    }

    /**
     * @param \Model\Avis $allAvis
     * @return Avis
     */
    public function addAllAvis(Avis $allAvis)
    {
        $this->allAvis[] = $allAvis;

        return $this;
    }

    /**
     * @param \Model\Avis $allAvis
     */
    public function removeAllAvis(Avis $allAvis)
    {
        $this->allAvis->removeElement($allAvis);
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getAllAvis()
    {
        return $this->allAvis;
    }

}
