<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Utils\Map;
use Doctrine\ORM\Mapping as ORM;

trait AddressableTrait
{
    /**
     * @ORM\Column(name="address", type="text", nullable=true)
     */
    protected $address;

    public function getAddress()
    {
        return $this->address;
    }

    public function setAddress($address = null)
    {
        $this->address = $address;

        return $this;
    }

    public function getFiledAddress(): string
    {
        if (!$this->getAddress()) {
            return '';
        }

        $value = Map::decodeAddressFromJson($this->getAddress());

        return $value ?? '';
    }
}
