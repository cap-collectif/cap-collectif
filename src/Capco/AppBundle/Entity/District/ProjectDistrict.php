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
    private $projectDistrictPositioner;

    public function __toString()
    {
        return $this->getId() ? $this->getName() : 'New district';
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public function getProjectDistrictPositioner()
    {
        return $this->projectDistrictPositioner;
    }

    public function setProjectDistrictPositioner($projectDistrictPositioner): self
    {
        $this->projectDistrictPositioner = $projectDistrictPositioner;

        return $this;
    }
}
