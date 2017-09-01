<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * District.
 *
 * @ORM\Table(name="district")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DistrictRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class District
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="name", type="string", length=100)
     */
    private $name;

    /**
     * @ORM\Column(name="geojson", type="json", nullable=true)
     */
    private $geojson;

     /**
      * @ORM\Column(name="display_on_map", nullable=false, type="boolean")
      */
     private $displayOnMap = false;

    /**
     * @Gedmo\Timestampable(on="change", field={"name"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private $updatedAt;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Proposal", mappedBy="district", cascade={"persist", "remove"})
     */
    private $proposals;

    public function __construct()
    {
        $this->updatedAt = new \Datetime();
        $this->proposals = new ArrayCollection();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getName() : 'New district';
    }

    public function getGeojson()
    {
        return $this->geojson;
    }

    public function setGeojson(string $geojson = null): self
    {
        $this->geojson = $geojson;

        return $this;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     *
     * @return $this
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    public function getProposals()
    {
        return $this->proposals;
    }

    /**
     * Add proposal.
     *
     * @param Proposal $proposal
     */
    public function addProposal(Proposal $proposal)
    {
        if (!$this->proposals->contains($proposal)) {
            $this->proposals[] = $proposal;
        }

        return $this;
    }

    /**
     * Remove proposal.
     *
     * @param Proposal $proposal
     */
    public function removeProposal(Proposal $proposal)
    {
        $this->proposals->removeElement($proposal);
    }
}
