<?php

namespace Capco\AdminBundle\Admin;

use Capco\MediaBundle\Provider\MediaProvider;
use Sonata\BlockBundle\Meta\Metadata;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Capco\AppBundle\Repository\SiteImageRepository;

class SiteImageAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'isEnabled',
    ];
    private MediaProvider $mediaProvider;

    public function __construct($code, $class, $baseControllerName, MediaProvider $mediaProvider)
    {
        parent::__construct($code, $class, $baseControllerName);
        $this->mediaProvider = $mediaProvider;
    }

    public function toString($object)
    {
        if (!\is_object($object)) {
            return '';
        }

        if (method_exists($object, '__toString') && null !== $object->__toString()) {
            return $this->getConfigurationPool()
                ->getContainer()
                ->get('translator')
                ->trans((string) $object, [], 'CapcoAppBundle');
        }

        return parent::toString($object);
    }

    public function postUpdate($object)
    {
        $entityManager = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager');
        $cacheDriver = $entityManager->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(SiteImageRepository::getValuesIfEnabledCacheKey());
    }

    // For mosaic view
    public function getObjectMetadata($object)
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

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false,
            ])
            ->add('media', ModelListType::class, [
                'required' => false,
                'label' => 'global.image',
            ]);
        if ($this->subject->isSocialNetworkThumbnail()) {
            $formMapper->addHelp('Media', 'admin.help.social_network_thumbnail');
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['edit']);
    }
}
