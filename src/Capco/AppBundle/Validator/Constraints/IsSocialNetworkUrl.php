<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class IsSocialNetworkUrl extends Constraint
{
    public string $message = 'global.is_not_social_network_url';
    public string $social_network;
    public array $authorizedNetworks = [
        'webPageUrl',
        'facebookUrl',
        'twitterUrl',
        'instagramUrl',
        'linkedInUrl',
        'youtubeUrl',
    ];

    public function validatedBy()
    {
        return IsSocialNetworkUrlValidator::class;
    }

    public function getDefaultOption()
    {
        return 'social_network';
    }

    /**
     * {@inheritdoc}
     */
    public function getRequiredOptions()
    {
        return ['social_network'];
    }

    public function getMessage()
    {
        switch ($this->social_network) {
            case 'facebookUrl':
                return 'global.is_not_facebook_url';
            case 'twitterUrl':
                return 'global.is_not_twitter_url';
            case 'youtubeUrl':
                return 'global.is_not_youtube_url';
            case 'instagramUrl':
                return 'global.is_not_instagram_url';
            case 'linkedInUrl':
                return 'global.is_not_linkedin_url';
            case 'webPageUrl':
                return 'global.is_not_webpage_url';
            default:
                return $this->message;
        }
    }
}
