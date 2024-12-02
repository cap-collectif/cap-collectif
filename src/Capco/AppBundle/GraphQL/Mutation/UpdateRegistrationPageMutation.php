<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Twig\SiteParameterRuntime;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateRegistrationPageMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private SiteParameterRepository $siteParameterRepository, private EntityManagerInterface $em, private RedisCache $cache)
    {
    }

    public function __invoke(Argument $args)
    {
        $this->formatInput($args);
        $customcode = $args->offsetGet('customcode');
        $codeParameter = $this->siteParameterRepository->findOneBy([
            'keyname' => SiteParameterRepository::REGISTRATION_PAGE_CODE_KEYNAME,
        ]);

        if ($codeParameter) {
            $codeParameter->setUpdatedAt(new \DateTime())->setValue($customcode);
            $this->em->flush();
        }

        $this->cache->deleteItem(
            SiteParameterRuntime::CACHE_KEY .
                SiteParameterRepository::REGISTRATION_PAGE_CODE_KEYNAME
        );

        return ['customcode' => $codeParameter->getValue()];
    }
}
