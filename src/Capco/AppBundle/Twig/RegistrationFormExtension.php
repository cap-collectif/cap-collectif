<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\RegistrationFormRepository;
use Symfony\Component\Serializer\SerializerInterface;
use Capco\AppBundle\Cache\RedisCache;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class RegistrationFormExtension extends AbstractExtension
{
    public const CACHE_KEY = 'RegistrationFormExtension';

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

    public function getFunctions(): array
    {
        return [new TwigFunction('registration_form_serialize', [$this, 'serializeFields'])];
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
                    'groups' => ['EmailDomain']
                ]
            );

            $data = [
                'bottomTextDisplayed' => $form ? $form->isBottomTextDisplayed() : '',
                'bottomText' => $form ? $form->getBottomText() : '',
                'topTextDisplayed' => $form ? $form->isTopTextDisplayed() : '',
                'topText' => $form ? $form->getTopText() : '',
                'hasQuestions' => $form ? $form->getRealQuestions()->count() > 0 : false,
                'domains' => json_decode($serializedDomains, true)
            ];

            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_MINUTE);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }
}
