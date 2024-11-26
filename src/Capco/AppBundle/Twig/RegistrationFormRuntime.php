<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Symfony\Component\Serializer\SerializerInterface;
use Twig\Extension\RuntimeExtensionInterface;

class RegistrationFormRuntime implements RuntimeExtensionInterface
{
    final public const CACHE_KEY = 'RegistrationFormExtension';

    protected $formRepo;
    protected $serializer;
    protected $cache;

    public function __construct(
        RegistrationFormRepository $formRepo,
        SerializerInterface $serializer,
        RedisCache $cache
    ) {
        $this->formRepo = $formRepo;
        $this->serializer = $serializer;
        $this->cache = $cache;
    }

    public function serializeFields(): array
    {
        $cachedItem = $this->cache->getItem(self::CACHE_KEY);

        if (!$cachedItem->isHit()) {
            $form = $this->formRepo->findCurrent();

            $serializedDomains = $this->serializer->serialize(
                $form ? $form->getDomains() : [],
                'json',
                [
                    'groups' => ['EmailDomain'],
                ]
            );

            $data = [
                'bottomTextDisplayed' => $form ? $form->isBottomTextDisplayed() : '',
                'bottomText' => $form ? $form->getBottomText() : '',
                'topTextDisplayed' => $form ? $form->isTopTextDisplayed() : '',
                'topText' => $form ? $form->getTopText() : '',
                'domains' => json_decode((string) $serializedDomains, true),
            ];

            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }
}
