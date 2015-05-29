<?php

namespace Capco\AppBundle\Handler\Api;

use Doctrine\ORM\EntityManager;

class SynthesisHandler
{
    protected $em;

    function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function getAll()
    {
        return $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->findAll();
    }


}
