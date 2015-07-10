<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Entity\Consultation;
use Sonata\CoreBundle\Model\Metadata;

class ConsultationAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    );

    protected $formOptions = array(
        'cascade_validation' => true,
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.consultation.title',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.consultation.author',
            ))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $datagridMapper->add('Themes', null, array(
                'label' => 'admin.fields.consultation.themes',
                ));
        }

        $datagridMapper
            ->add('steps', null, array(
                'label' => 'admin.fields.consultation.steps',
            ))
            ->add('events', null, array(
                'label' => 'admin.fields.consultation.events',
            ))
            ->add('posts', null, array(
                'label' => 'admin.fields.consultation.posts',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.consultation.is_enabled',
            ))
            ->add('exportable', null, array(
                'label' => 'admin.fields.consultation.exportable',
            ))
            ->add('publishedAt', null, array(
                'label' => 'admin.fields.consultation.published_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.consultation.updated_at',
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
                'label' => 'admin.fields.consultation.title',
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.consultation.author',
            ))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $listMapper->add('Themes', null, array(
                'label' => 'admin.fields.consultation.themes',
            ));
        }

        $listMapper
            ->add('isEnabled', null, array(
                'editable' => true,
                'label' => 'admin.fields.consultation.is_enabled',
            ))
            ->add('exportable', null, array(
                'editable' => true,
                'label' => 'admin.fields.consultation.exportable',
            ))
            ->add('publishedAt', null, array(
                'label' => 'admin.fields.consultation.published_at',
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
            ->with('admin.fields.consultation.group_content', array('class' => 'col-md-12'))->end()
            ->with('admin.fields.consultation.group_meta', array('class' => 'col-md-12'))->end()
            ->with('admin.fields.consultation.group_steps', array('class' => 'col-md-12'))->end()
            ->end()
        ;

        $formMapper
            // Content
            ->with('admin.fields.consultation.group_content')
            ->add('title', null, array(
                'label' => 'admin.fields.consultation.title',
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.consultation.author',
            ))
            ->end()

            // Metadata
            ->with('admin.fields.consultation.group_meta')
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.consultation.is_enabled',
                'required' => false,
            ))
            ->add('exportable', null, array(
                'label' => 'admin.fields.consultation.exportable',
                'required' => false,
            ))
            ->add('publishedAt', 'sonata_type_datetime_picker', array(
                'label' => 'admin.fields.consultation.published_at',
                'required' => true,
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => array(
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ),
            ))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $formMapper
                ->add('Themes', 'sonata_type_model', array(
                'label' => 'admin.fields.consultation.themes',
                'required' => false,
                'multiple' => true,
                'by_reference' => false,
            ));
        }

        $formMapper
            ->add('Cover', 'sonata_type_model_list', array(
                'required' => false,
                'label' => 'admin.fields.consultation.cover',
            ), array(
                'link_parameters' => array(
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
                ),
            ))
            ->add('video', null, array(
                'label' => 'admin.fields.consultation.video',
                'required' => false,
                'help' => 'admin.help.consultation.video',
                ), array(
                    'link_parameters' => array('context' => 'consultation'),
            ))
            ->end()

            // Steps
            ->with('admin.fields.consultation.group_steps')
            ->add('steps', 'sonata_type_collection', array(
                'label' => 'admin.fields.consultation.steps',
                'by_reference' => false,
                'required' => false,
            ), array(
                'edit' => 'inline',
                'inline' => 'table',
                'sortable' => 'position',
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
                'label' => 'admin.fields.consultation.title',
            ))
            ->add('isEnabled', 'boolean', array(
                'label' => 'admin.fields.consultation.is_enabled',
            ))
            ->add('exportable', null, array(
                'label' => 'admin.fields.consultation.exportable',
            ))
            ->add('publishedAt', null, array(
                'label' => 'admin.fields.consultation.published_at',
            ))
            ->add('Author', null, array(
                'label' => 'admin.fields.consultation.author',
            ))
            ->add('Cover', null, array(
                'template' => 'CapcoAdminBundle:Consultation:cover_show_field.html.twig',
                'label' => 'admin.fields.consultation.cover',
            ))
            ->add('video', null, array(
                'label' => 'admin.fields.consultation.video',
            ))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $showMapper->add('Themes', null, array(
                'label' => 'admin.fields.consultation.themes',
            ));
        }

        $showMapper
            ->add('steps', null, array(
                'label' => 'admin.fields.consultation.steps',
            ))
            ->add('events', null, array(
                'label' => 'admin.fields.consultation.events',
            ))
            ->add('posts', null, array(
                'label' => 'admin.fields.consultation.posts',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.consultation.created_at',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.consultation.updated_at',
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->add('getAllowedTypesFromConsultationType', 'allowed_types_from_consultation_types');
    }

    public function getTemplate($name)
    {
        if ($name == 'edit') {
            return 'CapcoAdminBundle:Step:edit.html.twig';
        }

        return parent::getTemplate($name);
    }

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $cover = $object->getCover();
        if ($cover != null) {
            $provider = $this->getConfigurationPool()->getContainer()->get($cover->getProviderName());
            $format = $provider->getFormatName($cover, 'form');
            $url = $provider->generatePublicUrl($cover, $format);

            return new Metadata($object->getTitle(), null, $url);
        }

        return parent::getObjectMetadata($object);
    }
}
