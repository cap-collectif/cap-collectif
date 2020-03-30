<?php

namespace Capco\AppBundle\RedirectionIO;

use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use RuntimeException;

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

    public function loadKey(): string
    {
        if (!$this->toggle->isActive('http_redirects')) {
            return '';
        }
        if (!$this->projectKey) {
            $projectKey = $this->siteParamRepository->findOneBy([
                'keyname' => 'redirectionio.project.id',
            ]);
            if (!$projectKey) {
                throw new RuntimeException('No project key is configured in database.');
            }
            $this->projectKey = $projectKey->getValue();
        }

        return $this->projectKey;
    }
}
