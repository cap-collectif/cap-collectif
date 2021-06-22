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

    public function isUsingAnySocialNetworks(): bool
    {
        $proposalForm = $this->getProposalForm();

        return $this->getProposalForm()->isUsingAnySocialNetworks() &&
            (($this->getYoutubeUrl() && $proposalForm->isUsingYoutube()) ||
                ($this->getWebPageUrl() && $proposalForm->isUsingWebPage()) ||
                ($this->getFacebookUrl() && $proposalForm->isUsingFacebook()) ||
                ($this->getLinkedInUrl() && $proposalForm->isUsingLinkedIn()) ||
                ($this->getTwitterUrl() && $proposalForm->isUsingTwitter()) ||
                ($this->getInstagramUrl() && $proposalForm->isUsingInstagram()));
    }
}
