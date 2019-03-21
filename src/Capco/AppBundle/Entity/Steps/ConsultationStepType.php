<?php

namespace Capco\AppBundle\Entity\Steps;

use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="consultation_step_type")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ConsultationStepTypeRepository")
 */
class ConsultationStepType
{
    use UuidTrait;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=100)
     * @Assert\NotNull()
     */
    private $title;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"title", "opinionTypes"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionType", mappedBy="consultationStepType", cascade={"persist", "remove"}, orphanRemoval=true)
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private $opinionTypes;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\ConsultationStep", inversedBy="consultationStepType")
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $step;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->opinionTypes = new ArrayCollection();
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        }

        return 'New consultation step type';
    }

    public function getStep()
    {
        return $this->step;
    }

    public function setStep(ConsultationStep $step = null): self
    {
        $this->step = $step;

        return $this;
    }

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get title.
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    public function setTitle($title): self
    {
        $this->title = $title;

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

    public function getOpinionTypes(): Collection
    {
        return $this->opinionTypes;
    }

    /**
     * @param $opinionTypes
     *
     * @return $this
     */
    public function setOpinionTypes($opinionTypes)
    {
        $this->opinionTypes = $opinionTypes;

        return $this;
    }

    /**
     * @param $opinionType
     *
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
     *
     * @return $this
     */
    public function removeOpinionType($opinionType)
    {
        $this->opinionTypes->removeElement($opinionType);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getRootOpinionTypes()
    {
        $roots = [];
        foreach ($this->opinionTypes as $opinionType) {
            if (!$opinionType->getParent()) {
                $roots[] = $opinionType;
            }
        }

        return $roots;
    }
}
