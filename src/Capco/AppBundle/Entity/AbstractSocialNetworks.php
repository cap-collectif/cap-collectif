<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

class AbstractSocialNetworks
{
    /**
     * @ORM\Column(name="web_page_url", type="string", length=255, nullable=true)
     */
    protected ?string $webPageUrl = null;

    /**
     * @ORM\Column(name="facebook_url", type="string", length=255, nullable=true)
     */
    protected ?string $facebookUrl = null;

    /**
     * @ORM\Column(name="twitter_url", type="string", length=255, nullable=true)
     */
    protected ?string $twitterUrl = null;

    /**
     * @ORM\Column(name="instagram_url", type="string", length=255, nullable=true)
     */
    protected ?string $instagramUrl = null;

    /**
     * @ORM\Column(name="linked_in_url", type="string", length=255, nullable=true)
     */
    protected ?string $linkedInUrl = null;

    /**
     * @ORM\Column(name="youtube_url", type="string", length=255, nullable=true)
     */
    protected ?string $youtubeUrl = null;

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
}
