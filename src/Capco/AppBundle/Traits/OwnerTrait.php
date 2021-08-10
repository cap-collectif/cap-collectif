<?php

namespace Capco\AppBundle\Traits;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

trait OwnerTrait
{
    /**
     * @ORM\ManyToOne(targetEntity=User::class)
     */
    protected ?User $owner = null;

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): self
    {
        $this->owner = $owner;

        return $this;
    }
}
