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
    public function setConsultation($consultation)
    {
        $this->consultation = $consultation;

        return $this;
    }
}
