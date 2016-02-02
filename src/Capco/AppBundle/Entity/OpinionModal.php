<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;

/**
 * @ORM\Table(name="opinion_modals")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionModalRepository")
 */
class OpinionModal
{
    use TimestampableTrait;
    use SluggableTitleTrait;

    /**
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\Column(name="modal_key", type="text", nullable=false)
     */
    private $key;

    /**
     * @ORM\Column(name="modal_before", type="text", nullable=false)
     */
    private $before;

    /**
     * @ORM\Column(name="modal_after", type="text", nullable=false)
     */
    private $after;

    /**
     * @ORM\Column(name="modal_diff", type="text", nullable=false)
     */
    private $diff;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="modals", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $opinion;

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    public function getKey()
    {
        return $this->key;
    }

    public function setKey($key)
    {
        $this->key = $key;

        return $this;
    }

    public function getBefore()
    {
        return $this->before;
    }

    public function setBefore($before)
    {
        $this->before = $before;

        return $this;
    }

    public function getAfter()
    {
        return $this->after;
    }

    public function setAfter($after)
    {
        $this->after = $after;

        return $this;
    }

    public function getDiff()
    {
        return $this->diff;
    }

    public function setDiff($diff)
    {
        $this->diff = $diff;

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
