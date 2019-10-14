<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\IdTrait;

/**
 * Alpha Project.
 *
 * This class is part of the sonata hack.
 *
 * @ORM\Table(name="project")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProjectRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class AlphaProject
{
    use IdTrait;
}
