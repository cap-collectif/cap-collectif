<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="user_in_group")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\UserGroupRepository")
 * @Assert\UniqueEntity(
 *   fields={"user", "group"},
 *   errorPath="user",
 *   message="user_group.not_unique"
 * )
 */
class UserGroup implements EntityInterface
{
    // TODO: remove this id, because it's useless, PK should be user+group
    use UuidTrait;

    /**
     * @var User
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="userGroups")
     * @ORM\JoinColumn(name="user_id", nullable=false, referencedColumnName="id")
     */
    protected $user;

    /**
     * @var Group
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Group", inversedBy="userGroups")
     * @ORM\JoinColumn(name="group_id", referencedColumnName="id")
     */
    protected $group;

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getGroup(): Group
    {
        return $this->group;
    }

    public function setGroup(Group $group): self
    {
        $this->group = $group;

        return $this;
    }
}
