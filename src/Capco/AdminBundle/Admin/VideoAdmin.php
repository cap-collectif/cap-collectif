<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Video;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;

class VideoAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'DESC',
        '_sort_by' => 'createdAt',
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.video.title',
            ))
            ->add('Author', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.video.author',
            ], null, array(
                'property' => 'username',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.video.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.video.updated_at',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.video.position',
            ))
            ->add('color', null, array(
                'label' => 'admin.fields.video.color',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.video.title',
            ))
            ->add('Author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.video.author',
                'property' => 'username',
            ])
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.video.is_enabled',
                'editable' => true,
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.video.updated_at',
            ))
            ->add('color', null, array(
                'label' => 'admin.fields.video.color',
                'template' => 'CapcoAdminBundle:OpinionType:color_list_field.html.twig',
                'typesColors' => Video::$colorButtonPlay,
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.video.position',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
                ),
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, array(
                'label' => 'admin.fields.video.title',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.video.body',
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.video.author',
                'required' => true,
            ))
            ->add('link', null, array(
                'label' => 'admin.fields.video.link',
                'required' => true,
                'help' => 'admin.help.project.video',
                'attr' => array(
                    'placeholder' => 'http://',
                ),
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.video.position',
            ))
            ->add('color', 'choice', array(
                'label' => 'admin.fields.video.color',
                'choices' => Video::$colorButtonPlay,
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->add('Media', 'sonata_type_model_list', array(
                'label' => 'admin.fields.video.media',
                'required' => false,
                'help' => 'admin.help.video.media',
            ), array(
                'link_parameters' => array(
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
                ),
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.video.is_enabled',
                'required' => false,
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();

        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.video.title',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.video.body',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.video.author',
            ))
            ->add('Media', 'sonata_media_type', array(
                'template' => 'CapcoAdminBundle:Event:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'admin.fields.video.media',
            ))
            ->add('color', null, array(
                'label' => 'admin.fields.video.color',
                'template' => 'CapcoAdminBundle:OpinionType:color_show_field.html.twig',
                'typesColors' => Video::$colorButtonPlay,
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.video.is_enabled',
                'editable' => true,
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.video.updated_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.video.created_at',
            ))
        ;
    }

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $media = $object->getMedia();
        if ($media != null) {
            $provider = $this->getConfigurationPool()->getContainer()->get($media->getProviderName());
            $format = $provider->getFormatName($media, 'form');
            $url = $provider->generatePublicUrl($media, $format);

            return new Metadata($object->getTitle(), null, $url);
        }

        return parent::getObjectMetadata($object);
    }
}
