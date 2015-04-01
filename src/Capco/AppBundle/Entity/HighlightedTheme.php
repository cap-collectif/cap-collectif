<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * HighlightedTheme.
 *
 * @ORM\Entity()
 */
class HighlightedTheme extends HighlightedContent
{
    /**
     * @ORM\OneToOne(targetEntity="Theme")
     */
    private $theme;

    /**
     * Gets the value of theme.
     *
     * @return mixed
     */
    public function getTheme()
    {
        return $this->theme;
    }

    /**
     * Sets the value of theme.
     *
     * @param mixed $theme the theme
     *
     * @return self
     */
    public function setTheme($theme)
    {
        $this->theme = $theme;

        return $this;
    }
}
