<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\HasDiffInterface;
use Capco\AppBundle\Traits\DiffableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="opinion_modals")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionModalRepository")
 */
class OpinionModal implements EntityInterface, HasDiffInterface
{
    use DiffableTrait;
    use SluggableTitleTrait;
    use TimestampableTrait;
    use UuidTrait;
    public $updatedAt;

    /**
     * @ORM\Column(name="modal_key", type="text", nullable=false)
     */
    private string $key;

    /**
     * @ORM\Column(name="modal_before", type="text", nullable=false)
     */
    private $before;

    /**
     * @ORM\Column(name="modal_after", type="text", nullable=false)
     */
    private $after;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="modals", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private $opinion;

    public function getKey(): string
    {
        return $this->key;
    }

    public function setKey(string $key): self
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
