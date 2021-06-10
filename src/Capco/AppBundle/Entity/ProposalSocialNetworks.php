<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="proposal_social_networks")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalSocialNetworksRepository")
 */
class ProposalSocialNetworks
{
    /**
     * @ORM\Column(name="web_page_url", type="string", length=255, nullable=true)
     */
    private ?string $webPageUrl;

    /**
     * @ORM\Column(name="facebook_url", type="string", length=255, nullable=true)
     */
    private ?string $facebookUrl;

    /**
     * @ORM\Column(name="twitter_url", type="string", length=255, nullable=true)
     */
    private ?string $twitterUrl;

    /**
     * @ORM\Column(name="instagram_url", type="string", length=255, nullable=true)
     */
    private ?string $instagramUrl;

    /**
     * @ORM\Column(name="linked_in_url", type="string", length=255, nullable=true)
     */
    private ?string $linkedInUrl;

    /**
     * @ORM\Column(name="youtube_url", type="string", length=255, nullable=true)
     */
    private ?string $youtubeUrl;

    /**
     * @ORM\Id()
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Proposal", inversedBy="proposalSocialNetworks")
     * @ORM\JoinColumn(nullable=false)
     */
    private Proposal $proposal;

    public function getWebPageUrl(): ?string
    {
        return $this->webPageUrl;
    }

    public function setWebPageUrl(?string $webPageUrl): self
    {
        $this->webPageUrl = $webPageUrl;

        return $this;
    }

    public function getFacebookUrl(): ?string
    {
        return $this->facebookUrl;
    }

    public function setFacebookUrl(?string $facebookUrl): self
    {
        $this->facebookUrl = $facebookUrl;

        return $this;
    }

    public function getTwitterUrl(): ?string
    {
        return $this->twitterUrl;
    }

    public function setTwitterUrl(?string $twitterUrl): self
    {
        $this->twitterUrl = $twitterUrl;

        return $this;
    }

    public function getInstagramUrl(): ?string
    {
        return $this->instagramUrl;
    }

    public function setInstagramUrl(?string $instagramUrl): self
    {
        $this->instagramUrl = $instagramUrl;

        return $this;
    }

    public function getLinkedInUrl(): ?string
    {
        return $this->linkedInUrl;
    }

    public function setLinkedInUrl(?string $linkedInUrl): self
    {
        $this->linkedInUrl = $linkedInUrl;

        return $this;
    }

    public function getYoutubeUrl(): ?string
    {
        return $this->youtubeUrl;
    }

    public function setYoutubeUrl(?string $youtubeUrl): self
    {
        $this->youtubeUrl = $youtubeUrl;

        return $this;
    }

    public function getProposal(): Proposal
    {
        return $this->proposal;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;

        return $this;
    }
}
