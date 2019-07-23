<?php

namespace Capco\AppBundle\Entity\Responses;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ValueResponseRepository")
 */
class ValueResponse extends AbstractResponse
{
    /**
     * @ORM\Column(name="value", type="json", nullable=true)
     */
    protected $value;


    // TODO: response.value !== "null" is a hotfix, related to issue https://github.com/cap-collectif/platform/issues/6214
    // because of a weird bug, causing answer with questions set to "null" instead of NULL in db
    public function getValue()
    {
        return $this->value !== 'null' ? $this->value : null;
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
