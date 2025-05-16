<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="opinion_appendices")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionAppendixRepository")
 */
class OpinionAppendix implements EntityInterface, ExportableContributionInterface, \Stringable
{
    use BodyUsingJoditWysiwygTrait;
    use TextableTrait;
    use TimestampableTrait;
    use UuidTrait;

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
    private AppendixType $appendixType;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="appendices", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $opinion;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
    }

    public function __toString(): string
    {
        return (string) $this->getId() ?? 'New OpinionAppendix';
    }

    public function getAppendixType(): AppendixType
    {
        return $this->appendixType;
    }

    public function setAppendixType(AppendixType $appendixType): self
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
