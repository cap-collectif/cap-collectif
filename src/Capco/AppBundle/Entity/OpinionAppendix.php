<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Traits\TimestampableTrait;

/**
 * @ORM\Table(name="opinion_appendices")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionAppendixRepository")
 */
class OpinionAppendix
{
    use TimestampableTrait;

    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private $body = null;

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

    public function __toString()
    {
        if ($this->id) {
            return (string) $this->id;
        }

        return 'New OpinionAppendix';
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

    public function getBody()
    {
        return $this->body;
    }

    public function setBody($body)
    {
        $this->body = $body;

        return $this;
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
