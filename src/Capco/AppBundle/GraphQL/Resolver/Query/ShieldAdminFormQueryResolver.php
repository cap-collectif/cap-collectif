<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ShieldAdminFormQueryResolver implements ResolverInterface
{
    protected $toggleManager;
    protected $siteParameterRepository;
    protected $siteImageRepository;

    public function __construct(
        Manager $toggleManager,
        SiteParameterRepository $siteParameterRepository,
        SiteImageRepository $siteImageRepository
    ) {
        $this->toggleManager = $toggleManager;
        $this->siteParameterRepository = $siteParameterRepository;
        $this->siteImageRepository = $siteImageRepository;
    }

    public function __invoke(): array
    {
        $introductionText = $this->siteParameterRepository->findOneBy([
            'keyname' => 'shield.introduction',
        ]);
        $logo = $this->siteImageRepository->findOneBy(['keyname' => 'image.shield']);

        return [
            'shieldMode' => $this->toggleManager->isActive('shield_mode'),
            'introduction' => $introductionText ? $introductionText->getValue() : null,
            'image' => $logo ? $logo->getMedia() : null,
        ];
    }
}
