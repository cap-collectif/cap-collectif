<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Problem
 *
 * @ORM\Table(name="problem")
 * @ORM\Entity
 */
class Problem extends Contribution
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;


    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }
}
