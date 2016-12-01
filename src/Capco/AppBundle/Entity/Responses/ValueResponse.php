<?php

namespace Capco\AppBundle\Entity\Responses;

use Doctrine\ORM\Mapping as ORM;

/**
 * Class ValueResponse.
 *
 * @ORM\Entity()
 */
class ValueResponse extends AbstractResponse
{
    /**
     * @ORM\Column(name="value", type="json", nullable=true)
     */
    protected $value;

    public function getValue()
    {
        return $this->value;
    }

    public function setValue($value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getType(): string
    {
        return 'value';
    }
}
