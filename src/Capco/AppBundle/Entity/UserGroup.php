<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;
use FOS\UserBundle\Model\UserInterface;

/**
 * @ORM\Table(name="user_in_group")
 * @ORM\Entity()
 */
class UserGroup
{
    use UuidTrait;

    /**
     * @var UserInterface
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id")
     */
    protected $user;

    /**
     * @var UserInterface
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Group")
     * @ORM\JoinColumn(name="group_id", referencedColumnName="id")
     */
    protected $group;

    public function getUser(): UserInterface
    {
        return $this->user;
    }

    public function setUser(UserInterface $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getGroup(): UserInterface
    {
        return $this->group;
    }

    public function setGroup(UserInterface $group): self
    {
        $this->group = $group;

        return $this;
    }
}
