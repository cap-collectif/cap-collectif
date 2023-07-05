<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Reporting;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;

class ReportingAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'reporting';

    public function getFeatures(): array
    {
        return ['reporting'];
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
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
                'label' => 'global.argument.label',
            ])
            ->add('Comment', null, [
                'label' => 'global.comment',
            ])
            ->add(
                'Reporter',
                ModelAutocompletetype::class,
                [
                    'label' => 'global.author',
                ],
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ]
            )
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('isArchived', null, [
                'label' => 'admin.fields.reporting.is_archived',
            ])
        ;
    }

    protected function configureListFields(ListMapper $list): void
    {
        //$this->setTemplate(
        $list
            ->addIdentifier('object', null, [
                'label' => 'global.contribution',
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
                'label' => 'global.author',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                ],
            ])
        ;
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('relatedObject', null, [
                'label' => 'global.contribution',
                'template' => 'CapcoAdminBundle:Reporting:object_show_field.html.twig',
                'mapped' => false,
            ])
            //            ->add('type', null, [
            //                'label' => 'admin.fields.reporting.type',
            //                'template' => 'CapcoAdminBundle:Reporting:type_show_field.html.twig',
            //                'mapped' => false,
            //            ])
            ->add('status', null, [
                'label' => 'admin.fields.reporting.status',
                'template' => 'CapcoAdminBundle:Reporting:status_show_field.html.twig',
                'statusLabels' => Reporting::$statusesLabels,
            ])
            ->add('body', null, [
                'label' => 'admin.fields.reporting.body',
                'template' => 'CapcoAdminBundle:Reporting:body_show_field.html.twig',
            ])
            ->add('isArchived', null, [
                'label' => 'admin.fields.reporting.is_archived',
                'editable' => true,
            ])
            ->add('Reporter', null, [
                'label' => 'global.author',
                'template' => 'CapcoAdminBundle:Reporting:reporter_show_field.html.twig',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
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
