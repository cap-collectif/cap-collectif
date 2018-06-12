<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ArgumentVote.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ArgumentVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class ArgumentVote extends AbstractVote
{
    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Argument", inversedBy="votes", cascade={"persist"})
     * @ORM\JoinColumn(name="argument_id", referencedColumnName="id", onDelete="CASCADE")
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

    public function getRelatedEntity()
    {
        return $this->argument;
    }

    // *************************** Lifecycle **********************************

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if (null !== $this->argument) {
            $this->argument->removeVote($this);
        }
    }
}
