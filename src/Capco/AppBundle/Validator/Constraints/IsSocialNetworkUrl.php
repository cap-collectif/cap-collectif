<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class IsSocialNetworkUrl extends Constraint
{
    public $message = 'global.is_not_social_network_url';
    public $social_network;

    public $authorizedNetworks = ['facebook', 'twitter', 'gplus'];

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
            case 'facebook':
                return 'global.is_not_facebook_url';
            case 'twitter':
                return 'global.is_not_twitter_url';
            case 'gplus':
                return 'global.is_not_google_url';
            default:
                return $this->message;
        }
    }
}
