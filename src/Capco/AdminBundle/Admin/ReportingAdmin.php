<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Reporting;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class ReportingAdmin extends AbstractAdmin
{
    public function getFeatures()
    {
        return ['reporting'];
    }

    public function getTemplate($name)
    {
        if ('show' === $name) {
            return 'CapcoAdminBundle:Reporting:show.html.twig';
        }

        return $this->getTemplateRegistry()->getTemplate($name);
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('status', null, [
                'label' => 'admin.fields.reporting.status',
            ])
            ->add('Opinion', null, [
                'label' => 'admin.fields.reporting.opinion',
            ])
            ->add('Source', null, [
                'label' => 'admin.fields.reporting.source',
            ])
            ->add('Argument', null, [
                'label' => 'admin.fields.reporting.argument',
            ])
            ->add('Comment', null, [
                'label' => 'admin.fields.reporting.comment',
            ])
            ->add(
                'Reporter',
                'doctrine_orm_model_autocomplete',
                [
                    'label' => 'admin.fields.reporting.reporter',
                ],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($enitity, $property) {
                        return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                    },
                ]
            )
            ->add('createdAt', null, [
                'label' => 'admin.fields.reporting.created_at',
            ])
            ->add('isArchived', null, [
                'label' => 'admin.fields.reporting.is_archived',
            ]);
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('object', null, [
                'label' => 'admin.fields.reporting.object',
                'template' => 'CapcoAdminBundle:Reporting:object_list_field.html.twig',
                'mapped' => false,
            ])
            ->add('type', null, [
                'label' => 'admin.fields.reporting.type',
                'template' => 'CapcoAdminBundle:Reporting:type_list_field.html.twig',
                'mapped' => false,
            ])
            ->add('status', null, [
                'label' => 'admin.fields.reporting.status',
                'template' => 'CapcoAdminBundle:Reporting:status_list_field.html.twig',
                'statusLabels' => Reporting::$statusesLabels,
            ])
            ->add('isArchived', null, [
                'label' => 'admin.fields.reporting.is_archived',
                'editable' => true,
            ])
            ->add('Reporter', null, [
                'label' => 'admin.fields.reporting.reporter',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.reporting.created_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                ],
            ]);
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('object', null, [
                'label' => 'admin.fields.reporting.object',
                'template' => 'CapcoAdminBundle:Reporting:object_show_field.html.twig',
                'mapped' => false,
            ])
            ->add('link', null, [
                'label' => 'admin.fields.reporting.link',
                'template' => 'CapcoAdminBundle:Reporting:link_show_field.html.twig',
            ])
            ->add('type', null, [
                'label' => 'admin.fields.reporting.type',
                'template' => 'CapcoAdminBundle:Reporting:type_show_field.html.twig',
                'mapped' => false,
            ])
            ->add('status', null, [
                'label' => 'admin.fields.reporting.status',
                'template' => 'CapcoAdminBundle:Reporting:status_show_field.html.twig',
                'statusLabels' => Reporting::$statusesLabels,
            ])
            ->add('body', null, [
                'label' => 'admin.fields.reporting.body',
            ])
            ->add('isArchived', null, [
                'label' => 'admin.fields.reporting.is_archived',
                'editable' => true,
            ])
            ->add('Reporter', null, [
                'label' => 'admin.fields.reporting.reporter',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.reporting.created_at',
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('edit');
        $collection->remove('delete');
        $collection->remove('list');
        $collection->add('archive', $this->getRouterIdParameter() . '/archive');
        $collection->add('disable', $this->getRouterIdParameter() . '/disable');
        $collection->add('trash', $this->getRouterIdParameter() . '/trash');
    }
}
