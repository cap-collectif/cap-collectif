<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="opinion_type_appendix_type")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionTypeAppendixTypeRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class OpinionTypeAppendixType
{
    use UuidTrait;
    use PositionableTrait;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OpinionType", inversedBy="appendixTypes", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_type_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $opinionType;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\AppendixType", inversedBy="opinionTypes", cascade={"persist"})
     * @ORM\JoinColumn(name="appendix_type_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $appendixType;

    public function __toString()
    {
        return $this->getId() ?? 'New OpinionTypeAppendixType';
    }

    public function getOpinionType()
    {
        return $this->opinionType;
    }

    public function setOpinionType(OpinionType $opinionType)
    {
        $this->opinionType = $opinionType;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getAppendixType()
    {
        return $this->appendixType;
    }

    public function setAppendixType($appendixType): self
    {
        $this->appendixType = $appendixType;

        return $this;
    }

    public function getAppendixTypeTitle()
    {
        return $this->appendixType ? $this->appendixType->getTitle() : null;
    }

    public function getAppendixTypeId(): ?string
    {
        return $this->appendixType ? $this->appendixType->getId() : null;
    }

    public function getAppendixTypeHelpText(): ?string
    {
        return $this->appendixType ? $this->appendixType->getHelpText() : null;
    }
}
