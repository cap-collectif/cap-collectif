<?php

namespace Capco\AppBundle\Behat\Traits;

trait IdeaStepsTrait
{
    protected static $ideaWithPinnedComments = [
        'slug' => 'troisieme-idee',
    ];

    /**
     * Go to an idea with pinned comments.
     *
     * @When I go to an idea with pinned comments
     */
    public function iGoToAnIdeaWithPinnedComments()
    {
        $this->visitPageWithParams('idea page', self::$ideaWithPinnedComments);
    }
}
