<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\MappedSuperclass
 */
abstract class AbstractStatistics
{
    use UuidTrait;

    /**
     * @ORM\Column(name="nbr_of_messages_sent_to_author", type="integer")
     */
    protected $nbrOfMessagesSentToAuthor = 0;

    protected function __construct(int $nbrOfMessagesSentToAuthor = 0)
    {
        $this->nbrOfMessagesSentToAuthor = $nbrOfMessagesSentToAuthor;
    }

    public function getNbrOfMessagesSentToAuthor(): ?int
    {
        return $this->nbrOfMessagesSentToAuthor;
    }

    public function setNbrOfMessagesSentToAuthor(int $nbrOfMessagesSentToAuthor): self
    {
        $this->nbrOfMessagesSentToAuthor = $nbrOfMessagesSentToAuthor;

        return $this;
    }

    public function incrementNbrOfMessagesSentToAuthor(): self
    {
        ++$this->nbrOfMessagesSentToAuthor;

        return $this;
    }
}
