<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * HighlightedTheme.
 *
 * @ORM\Entity()
 */
class HighlightedTheme extends HighlightedContent
{
    /**
     * @ORM\OneToOne(targetEntity="Theme")
     * @ORM\JoinColumn(name="theme_id", referencedColumnName="id", onDelete="CASCADE")
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
    public function setTheme(Theme $theme)
    {
        $this->theme = $theme;

        return $this;
    }

    public function getAssociatedFeatures()
    {
        return ['themes'];
    }

    public function getContent()
    {
        return $this->theme;
    }

    public function getType()
    {
        return 'theme';
    }

    public function getMedia()
    {
        return $this->theme->getMedia();
    }
}
