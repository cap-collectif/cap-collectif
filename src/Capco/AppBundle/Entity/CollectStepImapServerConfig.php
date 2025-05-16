<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Repository\CollectStepImapServerConfigRepository;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="collect_step_imap_server_config")
 * @ORM\Entity(repositoryClass=CollectStepImapServerConfigRepository::class)
 */
class CollectStepImapServerConfig
{
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=255, name="server_url")
     */
    private string $serverUrl;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $folder;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $email;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $password;

    /**
     * @ORM\OneToOne(targetEntity=CollectStep::class, inversedBy="collectStepImapServerConfig", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="collect_step_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private CollectStep $collectStep;

    public function getServerUrl(): string
    {
        return $this->serverUrl;
    }

    public function setServerUrl(string $serverUrl): self
    {
        $this->serverUrl = $serverUrl;

        return $this;
    }

    public function getFolder(): string
    {
        return $this->folder;
    }

    public function setFolder(string $folder): self
    {
        $this->folder = $folder;

        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getCollectStep(): CollectStep
    {
        return $this->collectStep;
    }

    public function setCollectStep(CollectStep $collectStep): self
    {
        $this->collectStep = $collectStep;

        return $this;
    }
}
