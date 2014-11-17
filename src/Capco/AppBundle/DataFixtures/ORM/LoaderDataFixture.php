<?php

namespace Capco\AppBundle\DataFixtures\ORM;

use Hautelook\AliceBundle\Alice\DataFixtureLoader;
use Nelmio\Alice\Fixtures;

class LoaderDataFixture extends DataFixtureLoader
{
    /**
     * {@inheritDoc}
     */
    protected function getFixtures()
    {
        return array(
            __DIR__ . '/User.yml',
            __DIR__ . '/Menu.yml',
            __DIR__ . '/MenuItem.yml',
            __DIR__ . '/SiteParameter.yml',
            __DIR__ . '/NewsletterSubscription.yml',
            __DIR__ . '/SocialNetwork.yml',
            __DIR__ . '/FooterSocialNetwork.yml',
            __DIR__ . '/ProblemType.yml',
            __DIR__ . '/OpinionType.yml',
            __DIR__ . '/Page.yml',
            __DIR__ . '/Consultation.yml',
            __DIR__ . '/Step.yml',
            __DIR__ . '/Theme.yml',
            __DIR__ . '/Idea.yml',
            __DIR__ . '/Opinion.yml',
            __DIR__ . '/Problem.yml',
            __DIR__ . '/Vote.yml',
            __DIR__ . '/Argument.yml',
            __DIR__ . '/ArgumentVote.yml',
            __DIR__ . '/Reporting.yml',
            __DIR__ . '/IdeaVote.yml',
        );
    }

}
