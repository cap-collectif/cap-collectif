<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;

class SocialNetworkAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title'
    ];

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

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'global.title'
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published'
            ])
            ->add('link', null, [
                'label' => 'global.link'
            ])
            ->add('position', null, [
                'label' => 'global.position'
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj'
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'global.title'
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'global.published'
            ])
            ->add('link', null, [
                'label' => 'global.link'
            ])
            ->add('media', 'sonata_media_type', [
                'template' => 'CapcoAdminBundle:SocialNetwork:media_list_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'global.image'
            ])
            ->add('position', null, [
                'label' => 'global.position'
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj'
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => []
                ]
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, [
                'label' => 'global.title'
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false
            ])
            ->add('link', null, [
                'label' => 'global.link'
            ])
            ->add('position', null, [
                'label' => 'global.position'
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
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'global.title'
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published'
            ])
            ->add('link', null, [
                'label' => 'global.link'
            ])
            ->add('media', 'sonata_media_type', [
                'template' => 'CapcoAdminBundle:SocialNetwork:media_show_field.html.twig',
                'label' => 'global.image'
            ])
            ->add('position', null, [
                'label' => 'global.position'
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation'
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj'
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}
