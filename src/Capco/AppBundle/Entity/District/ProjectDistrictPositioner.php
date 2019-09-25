<?php

namespace Capco\AppBundle\Entity\District;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProjectDistrictPositionerRepository")
 * @ORM\Table(name="project_district_positioner")
 */
class ProjectDistrictPositioner
{
    use UuidTrait;

    /**
     * @ORM\Column(name="position", type="integer")
     */
    private $position;
    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\District\ProjectDistrict", inversedBy="projectDistrictPositioner")
     */
    private $district;
    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Project", inversedBy="projectDistrictPositioner")
     */
    private $project;

    public function __toString(): string
    {
        return $this->getDistrict()->getName();
    }

    public function getPosition(): int
    {
        return $this->position;
    }

    public function setPosition($position): self
    {
        $this->position = $position;

        return $this;
    }

    public function getDistrict(): ProjectDistrict
    {
        return $this->district;
    }

    public function setDistrict($district): self
    {
        $this->district = $district;

        return $this;
    }

    public function getProject(): Project
    {
        return $this->project;
    }

    public function setProject($project): self
    {
        $this->project = $project;

        return $this;
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        return 10;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'projectDistrictPositioner';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch'];
    }
}
