<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

trait OwnerableTrait
{
    /**
     * @ORM\ManyToOne(targetEntity=User::class)
     */
    protected ?User $owner = null;

    /**
     * @ORM\ManyToOne(targetEntity=Organization::class)
     */
    protected ?Organization $organizationOwner = null;

    public function getOwner(): ?Owner
    {
        return $this->owner ?? $this->organizationOwner;
    }

    public function setOwner(?Owner $owner): self
    {
        if ($owner instanceof User) {
            $this->owner = $owner;
        }
        if ($owner instanceof Organization) {
            $this->organizationOwner = $owner;
        }

        return $this;
    }
}
