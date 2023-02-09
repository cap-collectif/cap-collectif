<?php

namespace Capco\AdminBundle\Admin;

use Doctrine\ORM\EntityManagerInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Capco\AppBundle\Repository\ProjectTypeRepository;

class ProjectTypeAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'project_type';
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'slug',
    ];

    private EntityManagerInterface $entityManager;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        EntityManagerInterface $entityManager
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->entityManager = $entityManager;
    }

    public function getBatchActions(): array
    {
        $actions = parent::getBatchActions();
        unset($actions['delete']);

        return $actions;
    }

    public function postUpdate($object): void
    {
        $cacheDriver = $this->entityManager->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(ProjectTypeRepository::findAllCacheKey());
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->addIdentifier('title', null, [
                'label' => 'global.type',
                'template' => 'CapcoAdminBundle:ProjectType:list_title.html.twig',
            ])
            ->add('color', null, [
                'label' => 'global.color',
                'template' => 'CapcoAdminBundle:ProjectType:list_color.html.twig',
                'header_style' => 'width: 13%',
            ]);
        $list->add('_action', 'actions', [
            'label' => 'link_actions',
            'actions' => ['edit' => ['header_style' => 'width: 5%; text-align: center']],
        ]);
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form->add('color', null, [
            'label' => 'global.value',
            'attr' => ['class' => 'minicolors-input'],
        ]);
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->remove('create');
        $collection->remove('show');
        $collection->remove('export');
    }
}
