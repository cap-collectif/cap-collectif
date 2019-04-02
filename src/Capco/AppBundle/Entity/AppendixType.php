<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="appendix_type")
 * @ORM\Entity()
 */
class AppendixType
{
    use UuidTrait;
    use SluggableTitleTrait;
    use TimestampableTrait;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"helpText", "title"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @ORM\Column(name="help", type="text")
     */
    private $helpText;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OpinionTypeAppendixType", cascade={"persist", "remove"}, mappedBy="appendixType", orphanRemoval = true)
     */
    private $opinionTypes;

    public function __construct()
    {
        $this->opinionTypes = new ArrayCollection();
        $this->updatedAt = new \DateTime();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New AppendixType';
    }

    /**
     * @return mixed
     */
    public function getHelpText(): ?string
    {
        return $this->helpText;
    }

    /**
     * @param mixed $helpText
     */
    public function setHelpText($helpText)
    {
        $this->helpText = $helpText;
    }

    /**
     * @return mixed
     */
    public function getOpinionTypes()
    {
        return $this->opinionTypes;
    }

    public function addOpinionTypes($opinionType)
    {
        $opinionType->setAppendixType($this);
        $this->opinionTypes[] = $opinionType;

        return $this;
    }

    public function removeOpinionType($opinionType)
    {
        $this->opinionTypes->removeElement($opinionType);

        return $this;
    }
}
