<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Enum\ForOrAgainstType;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait ForAgainstTrait
{
    /**
     * @ORM\Column(name="type", type="string", columnDefinition="ENUM('FOR', 'AGAINST')", nullable=true)
     * @Assert\Choice(choices=ForOrAgainstType::ALL)
     */
    private string $type = ForOrAgainstType::FOR;

    public function getType(): string
    {
        return $this->type;
    }

    public function isFor(): bool
    {
        return ForOrAgainstType::FOR === $this->getType();
    }

    public function isAgainst(): bool
    {
        return ForOrAgainstType::AGAINST === $this->getType();
    }

    public function setType(string $type): self
    {
        ForOrAgainstType::checkIsValid($type);
        $this->type = $type;

        return $this;
    }
}
