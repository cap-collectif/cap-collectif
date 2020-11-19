<?php

namespace Capco\AppBundle\Traits\User;

use Capco\UserBundle\FranceConnect\FranceConnectUserTrait;
use FOS\UserBundle\Util\Canonicalizer;

trait UserSSOTrait
{
    use FranceConnectUserTrait;
    use UserSSOParisTrait;
    use UserSSOOpenIdTrait;

    //saml
    protected ?string $samlId;

    public function setSamlAttributes(string $idp, array $attributes): void
    {
        if ($this->getId()) {
            return;
        }

        if ('daher' === $idp) {
            $this->setUsername(
                $attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'][0]
            );
            $this->setEmail(
                $attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'][0]
            );
            $this->setEmailCanonical(
                (new Canonicalizer())->canonicalize(
                    $attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'][0]
                )
            );
        }

        if ('grandest-preprod' === $idp || 'grandest' === $idp) {
            $this->setUsername($attributes['prenom'][0]);
            $this->setEmail($attributes['email'][0]);
            $this->setEmailCanonical((new Canonicalizer())->canonicalize($attributes['email'][0]));
        }
    }

    public function setSamlId(string $samlId): self
    {
        $this->samlId = $samlId;

        return $this;
    }

    public function getSamlId(): ?string
    {
        return $this->samlId;
    }

    //facebook
    protected ?string $facebook_id;
    protected ?string $facebook_access_token;
    protected ?string $facebookUrl;

    public function getFacebookAccessToken(): ?string
    {
        return $this->facebook_access_token;
    }

    public function setFacebookAccessToken(?string $facebook_access_token)
    {
        $this->facebook_access_token = $facebook_access_token;
    }

    public function getFacebookId(): ?string
    {
        return $this->facebook_id;
    }

    public function setFacebookId(?string $facebook_id): void
    {
        $this->facebook_id = $facebook_id;
    }

    public function getFacebookUrl(): ?string
    {
        return $this->facebookUrl;
    }

    public function setFacebookUrl(?string $facebookUrl): void
    {
        $this->facebookUrl = $facebookUrl;
    }

    //google
    protected ?string $google_id;
    protected ?string $google_access_token;

    public function getGoogleId(): ?string
    {
        return $this->google_id;
    }

    public function setGoogleId(?string $google_id): void
    {
        $this->google_id = $google_id;
    }

    public function getGoogleAccessToken(): ?string
    {
        return $this->google_access_token;
    }

    public function setGoogleAccessToken(?string $google_access_token): void
    {
        $this->google_access_token = $google_access_token;
    }

    //twitter
    protected ?string $twitter_id;
    protected ?string $twitter_access_token;
    protected ?string $twitterUrl;

    public function setTwitterId(?string $twitter_id): self
    {
        $this->twitter_id = $twitter_id;

        return $this;
    }

    public function getTwitterId(): ?string
    {
        return $this->twitter_id;
    }

    public function setTwitterAccessToken(?string $twitter_access_token): void
    {
        $this->twitter_access_token = $twitter_access_token;
    }

    public function getTwitterAccessToken(): ?string
    {
        return $this->twitter_access_token;
    }

    public function getTwitterUrl(): ?string
    {
        return $this->twitterUrl;
    }

    public function setTwitterUrl(?string $twitterUrl): void
    {
        $this->twitterUrl = $twitterUrl;
    }

    //linkedin
    protected ?string $linkedInUrl;

    public function getLinkedInUrl(): ?string
    {
        return $this->linkedInUrl;
    }

    public function setLinkedInUrl(?string $linkedInUrl): self
    {
        $this->linkedInUrl = $linkedInUrl;

        return $this;
    }


    protected ?\DateTime $credentialsExpireAt;
    protected bool $credentialsExpired = false;

    public function isCredentialsExpired(): bool
    {
        return $this->credentialsExpired;
    }

    public function setCredentialsExpired(bool $value): self
    {
        $this->credentialsExpired = $value;

        return $this;
    }

    public function getCredentialsExpireAt(): ?\DateTime
    {
        return $this->credentialsExpireAt;
    }

    public function setCredentialsExpireAt(?\DateTime $value): self
    {
        $this->credentialsExpireAt = $value;

        return $this;
    }

}
