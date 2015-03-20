<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\Common\Collections\ArrayCollection;


/**
 * ConsultationType
 *
 * @ORM\Table(name="consultation_type")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ConsultationTypeRepository")
 */
class ConsultationType
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
     * @Assert\NotNull()
     */
    private $title;


    /**
     * @var boolean
     *
     * @ORM\Column(name="enabled", type="boolean", nullable=false)
     */
    private $enabled = true;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "isEnabled", "opinionTypes"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\OpinionType")
     * @ORM\JoinTable(name="consultation_type_types")
     */
    private $opinionTypes;


    /**
     * Constructor
     */
    public function __construct()
    {
        $this->opinionTypes = new ArrayCollection();
        $this->updatedAt = new \Datetime;
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        } else {
            return "New consultation type";
        }
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
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
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
     * Is enabled
     *
     * @return boolean
     */
    public function enabled()
    {
        return $this->enabled;
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
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @return mixed
     */
    public function getOpinionTypes()
    {
        return $this->opinionTypes;
    }

    /**
     * @param $opinionTypes
     * @return $this
     */
    public function setOpinionTypes($opinionTypes)
    {
        $this->opinionTypes = $opinionTypes;

        return $this;
    }

    /**
     * @param $opinionType
     * @return $this
     */
    public function addOpinionType($opinionType)
    {
        if (!$this->opinionTypes->contains($opinionType)) {
            $this->opinionTypes[] = $opinionType;
        }

        return $this;
    }

    /**
     * @param $opinionType
     * @return $this
     */
    public function removeOpinionType($opinionType)
    {
        $this->opinionTypes->removeElement($opinionType);

        return $this;
    }
}
