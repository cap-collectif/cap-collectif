<?php

namespace Model;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Consultation
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Repository\ConsultationRepository")
 */
class Consultation
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
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created", type="datetime")
     */
    private $created;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated", type="datetime")
     */
    private $updated;

    /**
     * @var boolean
     *
     * @ORM\Column(name="enabled", type="boolean")
     */
    private $enabled;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="openDate", type="datetime")
     */
    private $openDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="closeDate", type="datetime")
     */
    private $closeDate;

    /**
     * @ORM\OneToMany(targetEntity="Model\Avis", mappedBy="consultation",  cascade={"persist", "remove"})
     */
    private $avis;


    /**
     * @ORM\OneToOne(targetEntity="Model\Media", cascade={"persist", "remove"})
     */
    private $image;



    public function __construct()
    {
        $this->avis = new ArrayCollection();
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
     * @return Consultation
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
     * Get created
     *
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * Get updated
     *
     * @return \DateTime
     */
    public function getUpdated()
    {
        return $this->updated;
    }

    /**
     * Set enabled
     *
     * @param boolean $enabled
     * @return Consultation
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
     * Set openDate
     *
     * @param \DateTime $openDate
     * @return Consultation
     */
    public function setOpenDate($openDate)
    {
        $this->openDate = $openDate;

        return $this;
    }

    /**
     * Get openDate
     *
     * @return \DateTime
     */
    public function getOpenDate()
    {
        return $this->openDate;
    }

    /**
     * Set closeDate
     *
     * @param \DateTime $closeDate
     * @return Consultation
     */
    public function setCloseDate($closeDate)
    {
        $this->closeDate = $closeDate;

        return $this;
    }

    /**
     * Get closeDate
     *
     * @return \DateTime
     */
    public function getCloseDate()
    {
        return $this->closeDate;
    }

    /**
     * @param \Model\Avis $avis
     * @return Avis
     */
    public function addAvis(Avis $avis)
    {
        $this->avis[] = $avis;

        return $this;
    }

    /**
     * @param \Model\Avis $avis
     */
    public function removeAvis(Avis $avis)
    {
        $this->avis->removeElement($avis);
    }

    /**
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getAvis()
    {
        return $this->avis;
    }

    /**
     * @param \Model\Media $image
     * @return Consultation
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
