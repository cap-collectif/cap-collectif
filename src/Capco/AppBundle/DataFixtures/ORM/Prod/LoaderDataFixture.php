<?php

namespace Capco\AppBundle\DataDemo\ORM\Prod;

use Hautelook\AliceBundle\Doctrine\DataFixtures\AbstractLoader;

class LoaderDataFixture extends AbstractLoader
{
    public function getFixtures()
    {
        return [
            __DIR__ . '/RegistrationForm.yml',
            __DIR__ . '/MediaContext.yml',
            __DIR__ . '/MediaCategory.yml',
            __DIR__ . '/Media.yml',
            __DIR__ . '/UserType.yml',
            __DIR__ . '/User.yml',
            __DIR__ . '/MenuItem.yml',
            __DIR__ . '/SiteParameter.yml',
            __DIR__ . '/SocialNetwork.yml',
            __DIR__ . '/FooterSocialNetwork.yml',
            __DIR__ . '/Page.yml',
            __DIR__ . '/Category.yml',
            __DIR__ . '/SiteImage.yml',
            __DIR__ . '/SiteColor.yml',
            __DIR__ . '/Section.yml',
            __DIR__ . '/PresentationStep.yml',
            __DIR__ . '/OtherStep.yml',
            __DIR__ . '/ProjectAbstractStep.yml',
            __DIR__ . '/ProjectType.yml',
            __DIR__ . '/Project.yml',
            __DIR__ . '/Post.yml',
            __DIR__ . '/Event.yml',
            __DIR__ . '/HighlightedContent.yml',
        ];
    }
}
