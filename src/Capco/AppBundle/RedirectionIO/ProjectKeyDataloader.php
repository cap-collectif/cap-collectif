<?php

namespace Capco\AppBundle\RedirectionIO;

use Capco\AppBundle\Repository\SiteParameterRepository;
use RuntimeException;

class ProjectKeyDataloader
{
    private $siteParamRepository;
    private $projectKey;


    public function __construct(SiteParameterRepository $siteParameterRepository)
    {
        $this->siteParamRepository = $siteParameterRepository;
    }

    public function loadKey(): string {
        if (!$this->projectKey){
            $projectKey = $this->siteParamRepository->findOneBy(['keyname' => 'redirectionio.project.id']);
            if (!$projectKey){
                throw new RuntimeException('No project key is configured in database.');
            }
            $this->projectKey = $projectKey->getValue();
        }
        return $this->projectKey;
    }

}
