<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * HighlightedConsultation.
 *
 * @ORM\Entity()
 */
class HighlightedConsultation extends HighlightedContent
{
    /**
     * @ORM\OneToOne(targetEntity="Consultation")
     */
    private $consultation;

    /**
     * Gets the value of consultation.
     *
     * @return mixed
     */
    public function getConsultation()
    {
        return $this->consultation;
    }

    /**
     * Sets the value of consultation.
     *
     * @param mixed $consultation the consultation
     *
     * @return self
     */
    public function setConsultation(Consultation $consultation)
    {
        $this->consultation = $consultation;

        return $this;
    }

    public function getAssociatedFeatures()
    {
        return [];
    }

    public function getType()
    {
        return 'consultation';
    }

    public function getContent()
    {
        return $this->consultation;
    }

    public function getMedia()
    {
        return $this->consultation->getCover();
    }
}
