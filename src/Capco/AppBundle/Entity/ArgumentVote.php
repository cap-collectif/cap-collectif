<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Doctrine\ORM\Mapping as ORM;

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

    public function getStep(): ?AbstractStep
    {
        return $this->argument ? $this->argument->getStep() : null;
    }

    public function getProject(): ?Project
    {
        return $this->getArgument()->getProject();
    }

    public function getConsultation(): ?Consultation
    {
        return $this->getRelated() ? $this->getRelated()->getConsultation() : null;
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

    public static function getElasticsearchSerializationGroups(): array
    {
        return array_merge(parent::getElasticsearchSerializationGroups(), [
            'ElasticsearchVoteNestedArgument',
            'ElasticsearchVoteNestedConsultation',
        ]);
    }
}
