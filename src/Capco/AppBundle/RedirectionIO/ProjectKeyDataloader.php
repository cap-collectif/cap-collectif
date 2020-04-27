<?php

namespace Capco\AppBundle\RedirectionIO;

use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;

class ProjectKeyDataloader
{
    private $siteParamRepository;
    private $projectKey;
    private $toggle;

    public function __construct(SiteParameterRepository $siteParameterRepository, Manager $toggle)
    {
        $this->siteParamRepository = $siteParameterRepository;
        $this->toggle = $toggle;
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
