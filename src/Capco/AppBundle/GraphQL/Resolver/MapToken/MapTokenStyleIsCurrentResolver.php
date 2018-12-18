<?php


namespace Capco\AppBundle\GraphQL\Resolver\MapToken;


use Capco\AppBundle\DTO\MapTokenStyleInterface;
use Capco\AppBundle\SiteParameter\Resolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class MapTokenStyleIsCurrentResolver implements ResolverInterface
{

    private $siteParameters;

    public function __construct(Resolver $siteParameters)
    {
        $this->siteParameters = $siteParameters;
    }

    public function __invoke(MapTokenStyleInterface $mapTokenStyle)
    {
        $currentUser = $this->siteParameters->getValue('map-setting-current-user');
        $currentStyleId = $this->siteParameters->getValue('map-setting-current-style-id');

        return $mapTokenStyle->getOwner() === $currentUser && $mapTokenStyle->getId() === $currentStyleId;
    }

}
