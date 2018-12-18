<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\MapTokenRepository;
use JMS\Serializer\SerializerInterface;

class MapTokensExtension extends \Twig_Extension
{
    private $repository;
    /**
     * @var SerializerInterface
     */
    private $serializer;

    public function __construct(MapTokenRepository $repository, SerializerInterface $serializer)
    {
        $this->repository = $repository;
        $this->serializer = $serializer;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction(
                'capco_map_tokens',
                [$this, 'getMapTokens'],
                ['is_safe' => 'html']
            ),
        ];
    }

    public function getMapTokens(): array
    {
        $mapTokens = [];
        foreach ($this->repository->getMapTokensGroupByProvider() as $mapToken) {
            list($styleId, $styleOwner, $publicToken) = [
                $mapToken->getStyleId(),
                $mapToken->getStyleOwner(),
                $mapToken->getPublicToken(),
            ];
            $mapTokens[$mapToken->getProvider()] = compact('styleId', 'styleOwner', 'publicToken');
        }

        return $mapTokens;
    }
}
