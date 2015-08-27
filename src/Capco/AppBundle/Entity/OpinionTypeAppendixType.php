<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\PositionableTrait;

/**
 * @ORM\Table(name="opinion_type_appendix_type")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionTypeAppendixTypeRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class OpinionTypeAppendixType
{
    use PositionableTrait;

    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

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
        if ($this->id) {
            return $this->id;
        }

        return 'New OpinionTypeAppendixType';
    }

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;

        return $this;
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

    /**
     * @param mixed $appendixType
     * @return this
     */
    public function setAppendixType($appendixType)
    {
        $this->appendixType = $appendixType;
        return $this;
    }
}
