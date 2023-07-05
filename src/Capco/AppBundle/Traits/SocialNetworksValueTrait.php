<?php

namespace Capco\AppBundle\Traits;

trait SocialNetworksValueTrait
{
    public function getWebPageUrl(): ?string
    {
        return $this->getProposalSocialNetworks()
            ? $this->getProposalSocialNetworks()->getWebPageUrl()
            : null;
    }

    public function getFacebookUrl(): ?string
    {
        return $this->getProposalSocialNetworks()
            ? $this->getProposalSocialNetworks()->getFacebookUrl()
            : null;
    }

    public function getTwitterUrl(): ?string
    {
        return $this->getProposalSocialNetworks()
            ? $this->getProposalSocialNetworks()->getTwitterUrl()
            : null;
    }

    public function getInstagramUrl(): ?string
    {
        return $this->getProposalSocialNetworks()
            ? $this->getProposalSocialNetworks()->getInstagramUrl()
            : null;
    }

    public function getLinkedInUrl(): ?string
    {
        return $this->getProposalSocialNetworks()
            ? $this->getProposalSocialNetworks()->getLinkedInUrl()
            : null;
    }

    public function getYoutubeUrl(): ?string
    {
        return $this->getProposalSocialNetworks()
            ? $this->getProposalSocialNetworks()->getYoutubeUrl()
            : null;
    }

    public function isProposalUsingAnySocialNetworks(): bool
    {
        $proposalForm = $this->getProposalForm();
        if (!$proposalForm) {
            return false;
        }

        if (!$proposalForm->isUsingAnySocialNetworks()) {
            return false;
        }

        if (!$this->getProposalSocialNetworks()) {
            return false;
        }

        return (bool) ($proposalForm->isUsingYoutube() && $this->getYoutubeUrl())
            || (bool) ($proposalForm->isUsingWebPage() && $this->getWebPageUrl())
            || (bool) ($proposalForm->isUsingFacebook() && $this->getFacebookUrl())
            || (bool) ($proposalForm->isUsingLinkedIn() && $this->getLinkedInUrl())
            || (bool) ($proposalForm->isUsingTwitter() && $this->getTwitterUrl())
            || (bool) ($proposalForm->isUsingInstagram() && $this->getInstagramUrl());
    }
}
