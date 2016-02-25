<?php

namespace Capco\AppBundle\Behat\Traits;

trait CommentStepsTrait
{
    /**
     * Pinned comments should be on top of the list.
     *
     * @Then pinned comments should be on top of the list
     */
    public function pinnedCommentsShouldBeOnTopOfTheList()
    {
        $this->element1ShouldBeBeforeElement2ForSelector(
            'Coucou ! Je suis un commentaire épinglé.',
            'Coucou, je suis un simple commentaire.',
            '.opinion--comment .opinion__text'
        );
    }

    /**
     * VIP comments should be on top of the list.
     *
     * @Then VIP comments should be on top of the list
     */
    public function VIPCommentsShouldBeOnTopOfTheList()
    {
        $this->element1ShouldBeBeforeElement2ForSelector(
            'Commentaire d\'un VIP !',
            'Coucou, je suis un simple commentaire.',
            '.opinion--comment .opinion__text'
        );
    }
}
