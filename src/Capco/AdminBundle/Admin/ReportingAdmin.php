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

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('status', null, [
                'label' => 'admin.fields.reporting.status'
            ])
            ->add('Opinion', null, [
                'label' => 'admin.fields.reporting.opinion'
            ])
            ->add('Source', null, [
                'label' => 'admin.fields.reporting.source'
            ])
            ->add('Argument', null, [
                'label' => 'global.argument.label'
            ])
            ->add('Comment', null, [
                'label' => 'global.comment'
            ])
            ->add(
                'Reporter',
                'doctrine_orm_model_autocomplete',
                [
                    'label' => 'global.author'
                ],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($enitity, $property) {
                        return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                    }
                ]
            )
            ->add('createdAt', null, [
                'label' => 'global.creation'
            ])
            ->add('isArchived', null, [
                'label' => 'admin.fields.reporting.is_archived'
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('object', null, [
                'label' => 'global.contribution',
                'template' => 'CapcoAdminBundle:Reporting:object_list_field.html.twig',
                'mapped' => false
            ])
            ->add('type', null, [
                'label' => 'admin.fields.reporting.type',
                'template' => 'CapcoAdminBundle:Reporting:type_list_field.html.twig',
                'mapped' => false
            ])
            ->add('status', null, [
                'label' => 'admin.fields.reporting.status',
                'template' => 'CapcoAdminBundle:Reporting:status_list_field.html.twig',
                'statusLabels' => Reporting::$statusesLabels
            ])
            ->add('isArchived', null, [
                'label' => 'admin.fields.reporting.is_archived',
                'editable' => true
            ])
            ->add('Reporter', null, [
                'label' => 'global.author'
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation'
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => []
                ]
            ]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('object', null, [
                'label' => 'global.contribution',
                'template' => 'CapcoAdminBundle:Reporting:object_show_field.html.twig',
                'mapped' => false
            ])
            ->add('link', null, [
                'label' => 'global.link',
                'template' => 'CapcoAdminBundle:Reporting:link_show_field.html.twig'
            ])
            ->add('type', null, [
                'label' => 'admin.fields.reporting.type',
                'template' => 'CapcoAdminBundle:Reporting:type_show_field.html.twig',
                'mapped' => false
            ])
            ->add('status', null, [
                'label' => 'admin.fields.reporting.status',
                'template' => 'CapcoAdminBundle:Reporting:status_show_field.html.twig',
                'statusLabels' => Reporting::$statusesLabels
            ])
            ->add('body', null, [
                'label' => 'admin.fields.reporting.body'
            ])
            ->add('isArchived', null, [
                'label' => 'admin.fields.reporting.is_archived',
                'editable' => true
            ])
            ->add('Reporter', null, [
                'label' => 'global.author'
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation'
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
