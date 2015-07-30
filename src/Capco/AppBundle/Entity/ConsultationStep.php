<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\OpinionType;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\Annotation as Serializer;

/**
 * Class ConsultationStep.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ConsultationStepRepository")
 * @Serializer\ExclusionPolicy("all")
 */
class ConsultationStep extends AbstractStep
{
    /**
     * @var int
     *
     * @ORM\Column(name="opinion_count", type="integer")
     */
    private $opinionCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="trashed_opinion_count", type="integer")
     */
    private $trashedOpinionCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="argument_count", type="integer")
     */
    private $argumentCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="trashed_argument_count", type="integer")
     */
    private $trashedArgumentCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="sources_count", type="integer")
     */
    private $sourcesCount = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="trashed_sources_count", type="integer")
     */
    private $trashedSourceCount = 0;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Opinion", mappedBy="step",  cascade={"persist", "remove"}, orphanRemoval=true)
     */
    private $opinions;

    /**
     * @var
     * @ORM\ManyToMany(targetEntity="Capco\AppBundle\Entity\OpinionType")
     * @ORM\JoinTable(name="consultationstep_opiniontypes")
     */
    private $allowedTypes;

    public function __construct()
    {
        parent::__construct();
        $this->opinions = new ArrayCollection();
        $this->allowedTypes = new ArrayCollection();
    }

    /**
     * @return int
     */
    public function getOpinionCount()
    {
        return $this->opinionCount;
    }

    /**
     * @param $opinionCount
     *
     * @return $this
     */
    public function setOpinionCount($opinionCount)
    {
        $this->opinionCount = $opinionCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getTrashedOpinionCount()
    {
        return $this->trashedOpinionCount;
    }

    /**
     * @param $trashedOpinionCount
     *
     * @return $this
     */
    public function setTrashedOpinionCount($trashedOpinionCount)
    {
        $this->trashedOpinionCount = $trashedOpinionCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getArgumentCount()
    {
        return $this->argumentCount;
    }

    /**
     * @param $argumentCount
     *
     * @return $this
     */
    public function setArgumentCount($argumentCount)
    {
        $this->argumentCount = $argumentCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getTrashedArgumentCount()
    {
        return $this->trashedArgumentCount;
    }

    /**
     * @param $trashedArgumentCount
     *
     * @return $this
     */
    public function setTrashedArgumentCount($trashedArgumentCount)
    {
        $this->trashedArgumentCount = $trashedArgumentCount;

        return $this;
    }

    /**
     * @return int
     */
    public function getSourcesCount()
    {
        return $this->sourcesCount;
    }

    /**
     * @param int $sourcesCount
     */
    public function setSourcesCount($sourcesCount)
    {
        $this->sourcesCount = $sourcesCount;
    }

    /**
     * @return int
     */
    public function getTrashedSourceCount()
    {
        return $this->trashedSourceCount;
    }

    /**
     * @param int $trashedSourceCount
     */
    public function setTrashedSourceCount($trashedSourceCount)
    {
        $this->trashedSourceCount = $trashedSourceCount;
    }

    /**
     * @return ArrayCollection
     */
    public function getOpinions()
    {
        return $this->opinions;
    }

    /**
     * @param $opinion
     *
     * @return $this
     */
    public function addOpinion($opinion)
    {
        if (!$this->opinions->contains($opinion)) {
            $this->opinions->add($opinion);
        }

        return $this;
    }

    /**
     * @param $opinion
     *
     * @return $this
     */
    public function removeOpinion($opinion)
    {
        $this->opinions->removeElement($opinion);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getAllowedTypes()
    {
        return $this->allowedTypes;
    }

    /**
     * @param $allowedTypes
     *
     * @return $this
     */
    public function setAllowedTypes($allowedTypes)
    {
        $this->allowedTypes = $allowedTypes;

        return $this;
    }

    /**
     * @param $allowedType
     *
     * @return $this
     */
    public function addAllowedType($allowedType)
    {
        if (!$this->allowedTypes->contains($allowedType)) {
            $this->allowedTypes[] = $allowedType;
        }

        return $this;
    }

    /**
     * @param $allowedType
     *
     * @return $this
     */
    public function removeAllowedType($allowedType)
    {
        $this->allowedTypes->removeElement($allowedType);

        return $this;
    }

    // **************************** Custom methods *******************************

    public function getType()
    {
        return 'consultation';
    }

    public function isConsultationStep()
    {
        return true;
    }

    /**
     * @return int
     */
    public function getContributionsCount()
    {
        return $this->argumentCount + $this->opinionCount + $this->trashedArgumentCount + $this->trashedOpinionCount + $this->sourcesCount + $this->trashedSourceCount;
    }

    /**
     * @param $opinionType
     *
     * @return bool
     */
    public function allowType($opinionType)
    {
        return $this->allowedTypes->contains($opinionType);
    }

    public function setConsultationType(ConsultationType $consultationType)
    {
        $this->allowedTypes = $consultationType->getOpinionTypes();
    }

    /**
     * Required for sonata admin.
     */
    public function getConsultationType()
    {
        return;
    }

    public function getMaximumPositionByOpinionType(OpinionType $type)
    {
        $position = 0;
        foreach ($this->getOpinions() as $opinion) {
            if ($opinion->getOpinionType() == $type && $opinion->getPosition() > $position) {
                $position = $opinion->getPosition();
            }
        }
        return $position;
    }

    public function getAllowedTypesIds()
    {
        foreach ($this->allowedTypes as $type) {
            $typesIds[] = $type->getId();
        }

        return $typesIds;
    }
}
