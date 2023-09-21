<?php

namespace Capco\AppBundle\Entity\District;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProjectDistrictPositionerRepository")
 * @ORM\Table(
 *  name="project_district_positioner",
 *  uniqueConstraints={
 *     @ORM\UniqueConstraint(
 *        name="project_district_position_unique",
 *        columns={"project_id", "district_id", "position"}
 *     ),
 *  })
 */
class ProjectDistrictPositioner
{
    use PositionableTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\District\ProjectDistrict", inversedBy="projectDistrictPositioners")
     */
    private ?ProjectDistrict $district = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Project", inversedBy="projectDistrictPositioners")
     */
    private ?Project $project = null;

    public function __toString(): string
    {
        return $this->getDistrict()->getName();
    }

    public function getDistrict(): ProjectDistrict
    {
        return $this->district;
    }

    public function setDistrict(?ProjectDistrict $district): self
    {
        $this->district = $district;

        return $this;
    }

    public function getProject(): Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): self
    {
        $this->project = $project;

        return $this;
    }
}
