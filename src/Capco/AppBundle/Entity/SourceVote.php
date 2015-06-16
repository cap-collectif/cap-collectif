<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ArgumentVote.
 *
 * @ORM\Entity
 * @ORM\HasLifecycleCallbacks()
 */
class SourceVote extends AbstractVote
{
    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Source", inversedBy="votes", cascade={"persist"})
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
    public function setSource($source)
    {
        $this->source = $source;
        $this->source->addVote($this);

        return $this;
    }

    public function getRelatedEntity()
    {
        return $this->source;
    }

    // ***************************** Lifecycle ****************************************

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if ($this->source != null) {
            $this->source->removeVote($this);
        }
    }
}
