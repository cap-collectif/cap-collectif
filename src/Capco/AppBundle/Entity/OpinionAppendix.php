<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="opinion_appendices")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionAppendixRepository")
 */
class OpinionAppendix
{
    use TextableTrait;
    use TimestampableTrait;
    use UuidTrait;
    use BodyUsingJoditWysiwygTrait;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"body", "appendixType"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private $body;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\AppendixType", cascade={"persist"})
     * @ORM\JoinColumn(name="appendix_type_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $appendixType;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="appendices", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $opinion;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
    }

    public function __toString()
    {
        return (string) $this->getId() ?? 'New OpinionAppendix';
    }

    public function getAppendixType()
    {
        return $this->appendixType;
    }

    public function setAppendixType(AppendixType $appendixType)
    {
        $this->appendixType = $appendixType;

        return $this;
    }

    public function getOpinion()
    {
        return $this->opinion;
    }

    public function setOpinion(Opinion $opinion)
    {
        $this->opinion = $opinion;

        return $this;
    }
}
