<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\MediaBundle\Provider\MediaProvider;
use Doctrine\ORM\EntityManagerInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Sonata\AdminBundle\Object\Metadata;
use Sonata\AdminBundle\Object\MetadataInterface;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

class SiteImageAdmin extends AbstractAdmin
{
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'isEnabled',
    ];
    private MediaProvider $mediaProvider;
    private EntityManagerInterface $entityManager;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        MediaProvider $mediaProvider,
        EntityManagerInterface $entityManager
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->mediaProvider = $mediaProvider;
        $this->entityManager = $entityManager;
    }

    public function toString($object): string
    {
        if (!\is_object($object)) {
            return '';
        }

        if (method_exists($object, '__toString') && null !== $object->__toString()) {
            return $this->getTranslator()
                ->trans((string) $object, [], 'CapcoAppBundle')
            ;
        }

        return parent::toString($object);
    }

    public function postUpdate($object): void
    {
        $cacheDriver = $this->entityManager->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(SiteImageRepository::getValuesIfEnabledCacheKey());
    }

    // For mosaic view
    public function getObjectMetadata($object): MetadataInterface
    {
        $media = $object->getMedia();
        if ($media) {
            return new Metadata(
                $object->getTitle(),
                null,
                $this->mediaProvider->generatePublicUrl(
                    $media,
                    $this->mediaProvider->getFormatName($media, 'form')
                )
            );
        }

        return parent::getObjectMetadata($object);
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false,
            ])
            ->add('media', ModelListType::class, [
                'required' => false,
                'label' => 'global.image',
                'help' => 'admin.help.social_network_thumbnail',
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['edit']);
    }
}
