<?php

namespace Capco\AppBundle\RedirectionIO;

use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;

class ProjectKeyDataloader
{
    private $projectKey;

    public function __construct(private readonly SiteParameterRepository $siteParamRepository, private readonly Manager $toggle)
    {
    }

    public function loadKey(): ?string
    {
        if (!$this->toggle->isActive('http_redirects')) {
            return null;
        }
        if (!$this->projectKey) {
            $projectKey = $this->siteParamRepository->findOneBy([
                'keyname' => 'redirectionio.project.id',
            ]);
            if (!$projectKey) {
                return null;
            }
            $this->projectKey = $projectKey->getValue();
        }

        return $this->projectKey;
    }
}
