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
        return match ($this->social_network) {
            'facebookUrl' => 'global.is_not_facebook_url',
            'twitterUrl' => 'global.is_not_twitter_url',
            'youtubeUrl' => 'global.is_not_youtube_url',
            'instagramUrl' => 'global.is_not_instagram_url',
            'linkedInUrl' => 'global.is_not_linkedin_url',
            'webPageUrl' => 'global.is_not_webpage_url',
            default => $this->message,
        };
    }
}
