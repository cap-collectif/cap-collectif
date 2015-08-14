<?php

namespace Capco\AppBundle\DataFixtures\ORM;

use Hautelook\AliceBundle\Alice\DataFixtureLoader;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;

class LoaderDataFixture extends DataFixtureLoader implements OrderedFixtureInterface
{
    protected function getProcessors()
    {
        return array(
            new MediaProcessor($this->container),
        );
    }

    public function getOrder()
    {
        return 2;
    }

    /**
     * {@inheritDoc}
     */
    protected function getFixtures()
    {
        return array(
            __DIR__.'/MediaContext.yml',
            __DIR__.'/MediaCategory.yml',
            __DIR__.'/Media.yml',
            __DIR__.'/UserType.yml',
            __DIR__.'/User.yml',
            __DIR__.'/MenuItem.yml',
            __DIR__.'/SiteParameter.yml',
            __DIR__.'/SiteImage.yml',
            __DIR__.'/SiteColor.yml',
            __DIR__.'/NewsletterSubscription.yml',
            __DIR__.'/SocialNetwork.yml',
            __DIR__.'/FooterSocialNetwork.yml',
            __DIR__.'/Theme.yml',
            __DIR__.'/Idea.yml',
            __DIR__.'/IdeaComment.yml',
            __DIR__.'/IdeaVote.yml',
            __DIR__.'/OpinionType.yml',
            __DIR__.'/OpinionTypePart.yml',
            __DIR__.'/ConsultationType.yml',
            __DIR__.'/Consultation.yml',
            __DIR__.'/ConsultationStep.yml',
            __DIR__.'/PresentationStep.yml',
            __DIR__.'/OtherStep.yml',
            __DIR__.'/Opinion.yml',
            __DIR__.'/OpinionPart.yml',
            __DIR__.'/OpinionVote.yml',
            __DIR__.'/OpinionVersion.yml',
            __DIR__.'/Category.yml',
            __DIR__.'/Source.yml',
            __DIR__.'/SourceVote.yml',
            __DIR__.'/Argument.yml',
            __DIR__.'/ArgumentVote.yml',
            __DIR__.'/Synthesis.yml',
            __DIR__.'/SynthesisStep.yml',
            __DIR__.'/ConsultationAbstractStep.yml',
            __DIR__.'/Post.yml',
            __DIR__.'/PostComment.yml',
            __DIR__.'/Event.yml',
            __DIR__.'/EventRegistration.yml',
            __DIR__.'/EventComment.yml',
            __DIR__.'/CommentVote.yml',
            __DIR__.'/Page.yml',
            __DIR__.'/Video.yml',
            __DIR__.'/Section.yml',
            __DIR__.'/HighlightedContent.yml',
        );
    }
}
