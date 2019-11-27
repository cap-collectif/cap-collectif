<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class ProjectTypeAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'slug',
    ];

    public function getBatchActions()
    {
        $actions = parent::getBatchActions();
        unset($actions['delete']);

        return $actions;
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.project.type.title',
                'template' => 'CapcoAdminBundle:ProjectType:list_title.html.twig',
            ])
            ->add('color', null, [
                'label' => 'global.color',
                'template' => 'CapcoAdminBundle:ProjectType:list_color.html.twig',
                'header_style' => 'width: 13%',
            ]);
        $listMapper->add('_action', 'actions', [
            'actions' => ['edit' => ['header_style' => 'width: 5%; text-align: center']],
        ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper->add('color', null, [
            'label' => 'global.value',
            'attr' => ['class' => 'minicolors-input'],
        ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
        $collection->remove('show');
        $collection->remove('export');
    }
}
