<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Entity\Steps\ConsultationStep;

/**
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
    public function getArgument(): Argument
    {
        return $this->argument;
    }

    /**
     * @param $argument
     *
     * @return $this
     */
    public function setArgument($argument): self
    {
        $this->argument = $argument;
        $argument->addVote($this);

        return $this;
    }

    public function getRelated()
    {
        return $this->argument;
    }

    public function getStep(): ?ConsultationStep
    {
        return $this->argument ? $this->argument->getStep() : null;
    }

    public function getProject(): ?Project
    {
        return $this->getArgument()->getProject();
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
