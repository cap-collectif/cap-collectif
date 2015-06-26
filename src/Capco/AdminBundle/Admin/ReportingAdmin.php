<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Entity\Reporting;

class ReportingAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by' => 'isArchived',
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('status', null, array(
                'label' => 'admin.fields.reporting.status',
            ))
            ->add('Opinion', null, array(
                'label' => 'admin.fields.reporting.opinion',
            ))
            ->add('Source', null, array(
                'label' => 'admin.fields.reporting.source',
            ))
            ->add('Argument', null, array(
                'label' => 'admin.fields.reporting.argument',
            ))
            ->add('Idea', null, array(
                'label' => 'admin.fields.reporting.idea',
            ))
            ->add('Comment', null, array(
                'label' => 'admin.fields.reporting.comment',
            ))
            ->add('Reporter', null, array(
                'label' => 'admin.fields.reporting.reporter',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.reporting.created_at',
            ))
            ->add('isArchived', null, array(
                'label' => 'admin.fields.reporting.is_archived',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('object', null, array(
                'label' => 'admin.fields.reporting.object',
                'template' => 'CapcoAdminBundle:Reporting:object_list_field.html.twig',
                'mapped' => false,
            ))
            ->add('type', null, array(
                'label' => 'admin.fields.reporting.type',
                'template' => 'CapcoAdminBundle:Reporting:type_list_field.html.twig',
                'mapped' => false,
            ))
            ->add('status', null, array(
                'label' => 'admin.fields.reporting.status',
                'template' => 'CapcoAdminBundle:Reporting:status_list_field.html.twig',
                'statusLabels' => Reporting::$statusesLabels,
            ))
            ->add('isArchived', null, array(
                'label' => 'admin.fields.reporting.is_archived',
                'editable' => true,
            ))
            ->add('Reporter', null, array(
                'label' => 'admin.fields.reporting.reporter',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.reporting.created_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'disable' => array(
                        'template' => 'CapcoAdminBundle:CRUD:list__action_disable.html.twig',
                    ),
                    'trash' => array(
                        'template' => 'CapcoAdminBundle:CRUD:list__action_trash.html.twig',
                    ),
                    'delete' => array(),
                ),
            ))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('object', null, array(
                'label' => 'admin.fields.reporting.object',
                'template' => 'CapcoAdminBundle:Reporting:object_show_field.html.twig',
                'mapped' => false,
            ))
            ->add('type', null, array(
                'label' => 'admin.fields.reporting.type',
                'template' => 'CapcoAdminBundle:Reporting:type_show_field.html.twig',
                'mapped' => false,
            ))
            ->add('status', null, array(
                'label' => 'admin.fields.reporting.status',
                'template' => 'CapcoAdminBundle:Reporting:status_show_field.html.twig',
                'statusLabels' => Reporting::$statusesLabels,
            ))
            ->add('isArchived', null, array(
                'label' => 'admin.fields.reporting.is_archived',
                'editable' => true,
            ))
            ->add('Reporter', null, array(
                'label' => 'admin.fields.reporting.reporter',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.reporting.created_at',
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('edit');
        $collection->add('disable', $this->getRouterIdParameter().'/disable');
        $collection->add('trash', $this->getRouterIdParameter().'/trash');
    }

    public function getFeatures()
    {
        return array(
            'reporting',
        );
    }
}
