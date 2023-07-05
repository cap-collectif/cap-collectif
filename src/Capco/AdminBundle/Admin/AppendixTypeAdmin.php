<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;

class AppendixTypeAdmin extends CapcoAdmin
{
    protected ?string $classnameLabel = 'appendix_type';
    protected array $formOptions = [
        'cascade_validation' => true,
    ];

    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('helpText', null, [
                'label' => 'global.help.text',
            ])
        ;
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->addIdentifier('title', null, [
                'label' => 'global.title',
            ])
            ->add('helpText', null, [
                'label' => 'global.help.text',
            ])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => [
                    'edit' => [],
                    'delete' => [],
                ],
            ])
        ;
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('helpText', null, [
                'label' => 'global.help.text',
            ])
        ;
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('title', null, [
                'label' => 'global.title',
                'required' => true,
            ])
            ->add('helpText', null, [
                'label' => 'global.help.text',
                'required' => false,
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['create', 'delete', 'list', 'edit']);
    }
}
