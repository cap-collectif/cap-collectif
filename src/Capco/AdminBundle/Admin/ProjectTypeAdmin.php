<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Capco\AppBundle\Repository\ProjectTypeRepository;

class ProjectTypeAdmin extends AbstractAdmin
{
    protected $classnameLabel = 'project_type';
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

    public function postUpdate($object)
    {
        $entityManager = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager');
        $cacheDriver = $entityManager->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(ProjectTypeRepository::findAllCacheKey());
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'global.type',
                'template' => 'CapcoAdminBundle:ProjectType:list_title.html.twig',
            ])
            ->add('color', null, [
                'label' => 'global.color',
                'template' => 'CapcoAdminBundle:ProjectType:list_color.html.twig',
                'header_style' => 'width: 13%',
            ]);
        $listMapper->add('_action', 'actions', [
            'label' => 'link_actions',
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
