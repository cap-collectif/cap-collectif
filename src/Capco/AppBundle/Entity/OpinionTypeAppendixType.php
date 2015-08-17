<?php

namespace Capco\AppBundle\Entity;

use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\PositionableTrait;


/**
 * @ORM\Table(name="opinion_type_appendices_type")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionTypeAppendixTypeRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class OpinionTypeAppendixType
{
    use SluggableTitleTrait;
    use TimestampableTrait;
    use PositionableTrait;

    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OpinionType", inversedBy="appendixTypes", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_type_id", referencedColumnName="id", nullable=true, onDelete="CASCADE")
     */
    private $opinionType;

    public function __construct($title = '')
    {
        $this->setTitle($title);
        $this->setPosition(0);
    }

    public function __toString()
    {
        if ($this->id) {
            return $this->getTitle();
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
}
