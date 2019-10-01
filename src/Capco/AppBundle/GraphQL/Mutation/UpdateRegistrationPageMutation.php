<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Twig\SiteParameterExtension;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateRegistrationPageMutation implements MutationInterface
{
    private $em;
    private $siteParameterRepository;
    private $cache;

    public function __construct(
        SiteParameterRepository $siteParameterRepository,
        EntityManagerInterface $em,
        RedisCache $cache
    ) {
        $this->siteParameterRepository = $siteParameterRepository;
        $this->em = $em;
        $this->cache = $cache;
    }

    public function __invoke(Argument $args)
    {
        $customcode = $args->offsetGet('customcode');
        $codeParameter = $this->siteParameterRepository->findOneBy([
            'keyname' => SiteParameterRepository::REGISTRATION_PAGE_CODE_KEYNAME
        ]);

        if ($codeParameter) {
            $codeParameter->setUpdatedAt(new \DateTime())->setValue($customcode);
            $this->em->flush();
        }

        $this->cache->deleteItem(
            SiteParameterExtension::CACHE_KEY .
                SiteParameterRepository::REGISTRATION_PAGE_CODE_KEYNAME
        );

        return ['customcode' => $codeParameter->getValue()];
    }
}
