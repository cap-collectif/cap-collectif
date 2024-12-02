<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Repository\ProjectTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

class ProjectTypeAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'project_type';
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'slug',
    ];

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        private readonly EntityManagerInterface $entityManager
    ) {
        parent::__construct($code, $class, $baseControllerName);
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
                'template' => '@CapcoAdmin/ProjectType/list_title.html.twig',
            ])
            ->add('color', null, [
                'label' => 'global.color',
                'template' => '@CapcoAdmin/ProjectType/list_color.html.twig',
                'header_style' => 'width: 13%',
            ])
        ;
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

    protected function configure(): void
    {
        $this->setTemplate('edit', '@CapcoAdmin/ProjectType/edit.html.twig');
    }
}
