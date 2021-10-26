<?php

namespace Capco\AppBundle\Traits\User;

use Capco\UserBundle\FranceConnect\FranceConnectUserTrait;
use FOS\UserBundle\Util\Canonicalizer;

trait UserSSOTrait
{
    use FranceConnectUserTrait;
    use UserSSOOpenIdTrait;
    use UserSSOParisTrait;

    //saml
    protected ?string $samlId = null;

    //CAS
    protected ?string $casId = null;

    //facebook
    protected ?string $facebook_id = null;
    protected ?string $facebook_access_token = null;
    protected ?string $facebookUrl = null;

    //twitter
    protected ?string $twitter_id = null;
    protected ?string $twitter_access_token = null;
    protected ?string $twitterUrl = null;

    //linkedin
    protected ?string $linkedInUrl = null;

    protected ?\DateTime $credentialsExpireAt = null;
    protected bool $credentialsExpired = false;

    public function setSamlAttributes(string $idp, array $attributes): void
    {
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

        if ('univ-lyon1' === $idp) {
            $this->setUsername($attributes['urn:oid:2.5.4.42'][0] . ' ' . $attributes['urn:oid:2.5.4.4'][0]);
            $this->setEmail($attributes['urn:oid:0.9.2342.19200300.100.1.3'][0]);
            $this->setEmailCanonical((new Canonicalizer())->canonicalize($attributes['urn:oid:0.9.2342.19200300.100.1.3'][0]));
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

    public function setCasId(?string $casId): self
    {
        $this->casId = $casId;

        return $this;
    }

    public function getCasId(): ?string
    {
        return $this->casId;
    }

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

    public function getLinkedInUrl(): ?string
    {
        return $this->linkedInUrl;
    }

    public function setLinkedInUrl(?string $linkedInUrl): self
    {
        $this->linkedInUrl = $linkedInUrl;

        return $this;
    }

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
