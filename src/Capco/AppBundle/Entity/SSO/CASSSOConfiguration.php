<?php

namespace Capco\AppBundle\Entity\SSO;

use Capco\AppBundle\DBAL\Enum\SSOType;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository")
 */
class CASSSOConfiguration extends AbstractSSOConfiguration
{
    /**
     * @ORM\Column(name="cas_version", type="integer")
     */
    protected int $casVersion;

    /**
     * @ORM\Column(name="cas_server_url", type="text", nullable=false)
     */
    protected string $casServerUrl;

    /**
     * @ORM\Column(name="cas_certificate_file", type="text", nullable=false)
     */
    protected string $casCertificateFile;

    public function __construct()
    {
        $this->ssoType = SSOType::CAS;
    }

    public function getCasVersion(): int
    {
        return $this->casVersion;
    }

    public function setCasVersion(int $casVersion): self
    {
        if (1 > $casVersion || 3 < $casVersion) {
            throw new \Exception('cas only accept version 1, 2 or 3');
        }
        $this->casVersion = $casVersion;

        return $this;
    }

    public function getCasServerUrl(): string
    {
        return $this->casServerUrl;
    }

    public function setCasServerUrl(string $casServerUrl): self
    {
        $this->casServerUrl = $casServerUrl;

        return $this;
    }

    public function getCasCertificateFile(): string
    {
        return $this->casCertificateFile;
    }

    public function setCasCertificateFile(string $casCertificateFile): self
    {
        $this->casCertificateFile = $casCertificateFile;

        return $this;
    }
}
