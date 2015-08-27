<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="appendix_type")
 * @ORM\Entity()
 */
class AppendixType
{
    use SluggableTitleTrait;
    use TimestampableTrait;

    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

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
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
        }

        return 'New AppendixType';
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

    /**
     * @return mixed
     */
    public function getHelpText()
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
