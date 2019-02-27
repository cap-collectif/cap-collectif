<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;

class SocialNetworkAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $media = $object->getMedia();
        if ($media) {
            $provider = $this->getConfigurationPool()->getContainer()->get($media->getProviderName());
            $format = $provider->getFormatName($media, 'form');
            $url = $provider->generatePublicUrl($media, $format);

            return new Metadata($object->getTitle(), null, $url);
        }

        return parent::getObjectMetadata($object);
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.social_network.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.social_network.is_enabled',
            ])
            ->add('link', null, [
                'label' => 'admin.fields.social_network.link',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.social_network.position',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.social_network.updated_at',
            ])
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.social_network.title',
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.social_network.is_enabled',
            ])
            ->add('link', null, [
                'label' => 'admin.fields.social_network.link',
            ])
            ->add('media', 'sonata_media_type', [
                'template' => 'CapcoAdminBundle:SocialNetwork:media_list_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'admin.fields.social_network.media',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.social_network.position',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.social_network.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ])
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, [
                'label' => 'admin.fields.social_network.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.social_network.is_enabled',
                'required' => false,
            ])
            ->add('link', null, [
                'label' => 'admin.fields.social_network.link',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.social_network.position',
            ])
            ->add('media', 'sonata_type_model_list', [
                'required' => false,
                'label' => 'admin.fields.social_network.media',
            ], [
                'link_parameters' => [
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
            ], ])
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.social_network.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.social_network.is_enabled',
            ])
            ->add('link', null, [
                'label' => 'admin.fields.social_network.link',
            ])
            ->add('media', 'sonata_media_type', [
                'template' => 'CapcoAdminBundle:SocialNetwork:media_show_field.html.twig',
                'label' => 'admin.fields.social_network.media',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.social_network.position',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.social_network.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.social_network.updated_at',
            ])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}
