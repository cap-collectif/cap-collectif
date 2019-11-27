<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\CoreBundle\Model\Metadata;

class SiteImageAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'isEnabled'
    ];

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

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $media = $object->getMedia();
        if ($media) {
            $provider = $this->getConfigurationPool()
                ->getContainer()
                ->get($media->getProviderName());
            $format = $provider->getFormatName($media, 'form');
            $url = $provider->generatePublicUrl($media, $format);

            return new Metadata($object->getTitle(), null, $url);
        }

        return parent::getObjectMetadata($object);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false
            ])
            ->add(
                'media',
                'sonata_type_model_list',
                [
                    'required' => false,
                    'label' => 'global.image'
                ],
                [
                    'link_parameters' => [
                        'context' => 'default',
                        'hide_context' => true,
                        'provider' => 'sonata.media.provider.image'
                    ]
                ]
            );
        if ($this->subject->isSocialNetworkThumbnail()) {
            $formMapper->addHelp('Media', 'admin.help.social_network_thumbnail');
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['edit']);
    }
}
