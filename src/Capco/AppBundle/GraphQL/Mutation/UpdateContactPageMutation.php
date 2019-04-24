<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Twig\SiteParameterExtension;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateContactPageMutation implements MutationInterface
{
    private const CONTACT_PAGE_TITLE_KEYNAME = 'contact.title';
    private const CONTACT_PAGE_DESCRIPTION_KEYNAME = 'contact.content.body';
    private const CONTACT_PAGE_PICTO_KEYNAME = 'contact.picto';
    private const CONTACT_PAGE_META_KEYNAME = 'contact.metadescription';
    private const CONTACT_PAGE_CODE_KEYNAME = 'contact.customcode';

    private $siteParameterRepository;
    private $imageRepository;
    private $em;
    private $cache;

    public function __construct(
        SiteParameterRepository $siteParameterRepository,
        EntityManagerInterface $em,
        RedisCache $cache,
        SiteImageRepository $imageRepository
    ) {
        $this->siteParameterRepository = $siteParameterRepository;
        $this->em = $em;
        $this->cache = $cache;
        $this->imageRepository = $imageRepository;
    }

    public function __invoke(Argument $args): array
    {
        list($title, $description, $picto, $metadescription, $customcode) = [
            $args->offsetGet('title'),
            $args->offsetGet('description'),
            $args->offsetGet('picto'),
            $args->offsetGet('metadescription'),
            $args->offsetGet('customcode'),
        ];
        $titleParameter = $this->siteParameterRepository->findOneBy([
            'keyname' => self::CONTACT_PAGE_TITLE_KEYNAME,
        ]);
        $descriptionParameter = $this->siteParameterRepository->findOneBy([
            'keyname' => self::CONTACT_PAGE_DESCRIPTION_KEYNAME,
        ]);
        $metadatasParameter = $this->siteParameterRepository->findOneBy([
            'keyname' => self::CONTACT_PAGE_META_KEYNAME,
        ]);
        $pictoParameter = $this->imageRepository->findOneBy([
            'keyname' => self::CONTACT_PAGE_PICTO_KEYNAME,
        ]);
        $codeParameter = $this->siteParameterRepository->findOneBy([
            'keyname' => self::CONTACT_PAGE_CODE_KEYNAME,
        ]);

        if (
            $titleParameter &&
            $descriptionParameter &&
            $metadatasParameter &&
            $codeParameter &&
            $pictoParameter
        ) {
            if ($title) {
                $titleParameter->setValue($title);
            }
            if ($description) {
                $descriptionParameter->setValue($description);
            }
            if ($metadescription) {
                $metadatasParameter->setValue($metadescription);
            }
            if ($customcode) {
                $codeParameter->setValue($customcode);
            }
            if ($picto) {
                $pictoParameter->setValue($picto);
            }
        } else {
            throw new \RuntimeException('Site parameters not found');
        }

        $this->em->flush();
        foreach (
            [
                self::CONTACT_PAGE_META_KEYNAME,
                self::CONTACT_PAGE_CODE_KEYNAME,
                self::CONTACT_PAGE_TITLE_KEYNAME,
                self::CONTACT_PAGE_PICTO_KEYNAME,
                self::CONTACT_PAGE_DESCRIPTION_KEYNAME,
            ]
            as $item
        ) {
            $this->cache->deleteItem(SiteParameterExtension::CACHE_KEY . $item);
        }

        return [
            'title' => $titleParameter->getValue(),
            'description' => $descriptionParameter->getValue(),
            'metadescription' => $metadatasParameter->getValue(),
            'customcode' => $codeParameter->getValue(),
            'picto' => $pictoParameter,
        ];
    }
}
