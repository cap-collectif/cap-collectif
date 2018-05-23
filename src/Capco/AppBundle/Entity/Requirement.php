<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="requirement")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\RequirementRepository")
 */
class Requirement
{
    use UuidTrait;

    const CHECKBOX = 0;
    const FIRSTNAME = 1;
    const LASTNAME = 2;
    const PHONE = 3;

    /**
     * @ORM\Column(name="type", type="integer")
     * @Assert\NotNull()
     */
    private $type = self::FIRSTNAME;

    /**
     * @ORM\Column(name="label", type="string", nullable=true)
     */
    private $label = null;

    public function getType(): int
    {
        return $this->type;
    }

    public function setType(int $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(string $label): self
    {
        $this->label = $label;

        return $this;
    }
}
