<?php

namespace Capco\AppBundle\Entity\District;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProjectDistrictRepository")
 */
class ProjectDistrict extends AbstractDistrict
{
    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\District\ProjectDistrictPositioner", mappedBy="district", cascade={"persist", "remove"})
     */
    private $projectDistrictPositioners;

    public function __toString(): string
    {
        return $this->getId() ? $this->getName() : 'New district';
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public function getProjectDistrictPositioners(): iterable
    {
        return $this->projectDistrictPositioners;
    }

    public function setProjectDistrictPositioners(iterable $projectDistrictPositioners): self
    {
        $this->projectDistrictPositioners = $projectDistrictPositioners;

        return $this;
    }
}
