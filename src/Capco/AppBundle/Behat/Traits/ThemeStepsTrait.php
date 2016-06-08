<?php

namespace Capco\AppBundle\Behat\Traits;

trait ThemeStepsTrait
{
    protected static $theme = [
        'themeSlug' => 'immobilier',
    ];

    protected static $emptyTheme = [
        'themeSlug' => 'theme-vide',
    ];

    /**
     * Go to a theme page.
     *
     * @When I go to a theme page
     */
    public function iGoToAThemePage()
    {
        $this->visitPageWithParams('theme page', self::$theme);
    }

    /**
     * Go to an empty theme page.
     *
     * @When I go to an empty theme page
     */
    public function iGoToAnEmptyThemePage()
    {
        $this->visitPageWithParams('theme page', self::$emptyTheme);
    }
}
