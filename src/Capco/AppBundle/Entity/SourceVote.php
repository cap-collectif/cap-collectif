<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Entity\Steps\ConsultationStep;

/**
 * SourceVote.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SourceVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class SourceVote extends AbstractVote
{
    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Source", inversedBy="votes", cascade={"persist"})
     * @ORM\JoinColumn(name="source_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $source;

    /**
     * @return mixed
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * @param mixed $source
     *
     * @return $this
     */
    public function setSource(Source $source): self
    {
        $this->source = $source;
        $this->source->addVote($this);

        return $this;
    }

    public function getStep(): ?ConsultationStep
    {
        return $this->source ? $this->source->getStep() : null;
    }

    public function getRelated()
    {
        return $this->source;
    }

    public function getProject(): Project
    {
        return $this->getSource()->getProject();
    }

    // ***************************** Lifecycle ****************************************

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if (null !== $this->source) {
            $this->source->removeVote($this);
        }
    }
}
