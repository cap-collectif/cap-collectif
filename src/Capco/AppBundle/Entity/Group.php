<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\BlameableTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="user_group")
 * @ORM\Entity()
 */
class Group
{
    use UuidTrait;
    use TimestampableTrait;
    use SluggableTitleTrait;
    use BlameableTrait;

    /**
     * @ORM\Column(name="description", type="text")
     */
    private $description;

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description)
    {
        $this->description = $description;

        return $this;
    }
}
