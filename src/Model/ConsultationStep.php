<?php

namespace Model;

use Doctrine\ORM\Mapping as ORM;

/**
 * ConsultationStep
 *
 * @ORM\Table()
 * @ORM\Entity
 */
class ConsultationStep extends Step
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
