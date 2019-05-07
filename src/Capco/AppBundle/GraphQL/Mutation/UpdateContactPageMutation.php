<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Twig\SiteParameterExtension;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateContactPageMutation implements MutationInterface
{
    private const CONTACT_PAGE_TITLE_KEYNAME = 'contact.title';
    private const CONTACT_PAGE_DESCRIPTION_KEYNAME = 'contact.content.body';
    private $repository;
    private $em;
    private $cache;

    public function __construct(
        SiteParameterRepository $repository,
        EntityManagerInterface $em,
        RedisCache $cache
    ) {
        $this->repository = $repository;
        $this->em = $em;
        $this->cache = $cache;
    }

    public function __invoke(Argument $args): array
    {
        list($title, $description) = [$args->offsetGet('title'), $args->offsetGet('description')];
        $titleParameter = $this->repository->findOneBy([
            'keyname' => self::CONTACT_PAGE_TITLE_KEYNAME,
        ]);
        $descriptionParameter = $this->repository->findOneBy([
            'keyname' => self::CONTACT_PAGE_DESCRIPTION_KEYNAME,
        ]);

        if ($titleParameter && $descriptionParameter) {
            $titleParameter->setValue($title);
            $descriptionParameter->setValue($description);
        } else {
            throw new \RuntimeException('Site parameters not found');
        }

        $this->em->flush();
        foreach (
            [self::CONTACT_PAGE_DESCRIPTION_KEYNAME, self::CONTACT_PAGE_TITLE_KEYNAME]
            as $item
        ) {
            $this->cache->deleteItem(SiteParameterExtension::CACHE_KEY . $item);
        }

        return [
            'title' => $titleParameter->getValue(),
            'description' => $descriptionParameter->getValue(),
        ];
    }
}
