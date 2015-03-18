<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait PrivatableTrait
{
    /**
     * @ORM\Column(name="private", type="boolean", nullable=false)
     */
    private $private;

    /**
     * @return mixed
     */
    public function isPrivate()
    {
        return $this->private;
    }

    /**
     * @param mixed $private
     *
     * @return $this
     */
    public function setPrivate($private)
    {
        $this->private = $private;

        return $this;
    }

}
