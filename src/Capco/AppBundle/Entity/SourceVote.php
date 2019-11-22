<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Doctrine\ORM\Mapping as ORM;

/**
 * SourceVote.
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SourceVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class SourceVote extends AbstractVote
{
    /**
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

    public function getStep(): ?AbstractStep
    {
        return $this->getSource() ? $this->getSource()->getStep() : null;
    }

    public function getRelated()
    {
        return $this->source;
    }

    public function getProject(): ?Project
    {
        return $this->getSource()->getProject();
    }

    public function getConsultation(): ?Consultation
    {
        return $this->getRelated() ? $this->getRelated()->getConsultation() : null;
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

    public static function getElasticsearchSerializationGroups(): array
    {
        return array_merge(parent::getElasticsearchSerializationGroups(), [
            'ElasticsearchNestedSource',
            'ElasticsearchNestedConsultation'
        ]);
    }
}
