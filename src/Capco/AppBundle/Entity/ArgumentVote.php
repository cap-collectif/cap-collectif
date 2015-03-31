<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ArgumentVote.
 *
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks()
 */
class ArgumentVote extends AbstractVote
{
    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Argument", inversedBy="Votes", cascade={"persist"})
     */
    private $argument;

    /**
     * @return mixed
     */
    public function getArgument()
    {
        return $this->argument;
    }

    /**
     * @param $argument
     *
     * @return $this
     */
    public function setArgument($argument)
    {
        $this->argument = $argument;
        $argument->addVote($this);

        return $this;
    }

    // *************************** Lifecycle **********************************

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if ($this->argument != null) {
            $this->argument->removeVote($this);
        }
    }
}
