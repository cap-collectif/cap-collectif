<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait HighlitableTrait
{

    /**
     * @ORM\Column(name="highlighted", type="boolean", nullable=false)
     */
    private $highlighted = false;

    /**
     * @ORM\Column(name="highlighted_at", type="datetime", nullable=true)
     */
    private $highlightedAt;

    /**
     * @return mixed
     */
    public function isHighlighted()
    {
        return $this->highlighted;
    }

    /**
     * @param mixed $highlighted
     *
     * @return $this
     */
    public function setHighlighted($highlighted)
    {
        $this->highlighted = $highlighted;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getHighlightedAt()
    {
        return $this->highlightedAt;
    }

    /**
     * @param mixed $highlightedAt
     *
     * @return $this
     */
    public function setHighlightedAt($highlightedAt = null)
    {
        $this->highlightedAt = $highlightedAt;

        return $this;
    }
}
