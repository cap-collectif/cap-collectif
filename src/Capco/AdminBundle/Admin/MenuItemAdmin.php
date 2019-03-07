<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Manager\MenuItemResolver;
use Capco\AppBundle\Repository\MenuItemRepository;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class MenuItemAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'menu',
    ];

    public function createQuery($context = 'list')
    {
        $resolver = $this->getConfigurationPool()
            ->getContainer()
            ->get(MenuItemResolver::class);

        $all = $this->getConfigurationPool()
            ->getContainer()
            ->get(MenuItemRepository::class)
            ->findAll();

        $ids = [];
        foreach ($all as $mi) {
            if ($resolver->hasEnabledFeatures($mi)) {
                $ids[] = $mi->getId();
            }
        }

        $query = parent::createQuery($context);
        $query->andWhere($query->expr()->in($query->getRootAliases()[0] . '.id', ':ids'));
        $query->setParameter('ids', $ids);

        return $query;
    }

    public function prePersist($menuItem)
    {
        $this->manageLink($menuItem);
    }

    public function preUpdate($menuItem)
    {
        $this->manageLink($menuItem);
    }

    public function getBatchActions()
    {
        return [];
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.menu_item.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.menu_item.is_enabled',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.menu_item.position',
            ])
            ->add(
                'parent',
                null,
                [
                    'label' => 'admin.fields.menu_item.parent',
                ],
                'entity',
                [
                    'query_builder' => $this->createParentsItemQuery(),
                ]
            )
            ->add('Page', null, [
                'label' => 'admin.fields.menu_item.page',
            ])
            ->add('link', null, [
                'label' => 'admin.fields.menu_item.link',
            ]);
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.menu_item.title',
            ])
            ->add('menu', null, [
                'label' => 'admin.fields.menu_item.menu',
                'template' => 'CapcoAdminBundle:MenuItem:menu_list_field.html.twig',
                'menuLabels' => MenuItem::$menuLabels,
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.menu_item.is_enabled',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.menu_item.position',
            ])
            ->add('parent', 'sonata_type_admin', [
                'label' => 'admin.fields.menu_item.parent',
            ])
            ->add('Page', 'sonata_type_admin', [
                'label' => 'admin.fields.menu_item.page',
            ])
            ->add('link', null, [
                'label' => 'admin.fields.menu_item.link',
                'template' => 'CapcoAdminBundle:MenuItem:link_list_field.html.twig',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.menu_item.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [
                        'template' => 'CapcoAdminBundle:MenuItem:list__action_delete.html.twig',
                    ],
                ],
            ]);
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, [
                'label' => 'admin.fields.menu_item.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.menu_item.is_enabled',
                'required' => false,
            ])
            ->add('menu', 'choice', [
                'label' => 'admin.fields.menu_item.menu',
                'choices' => array_flip(MenuItem::$menuLabels),
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ])
            ->add('position', null, [
                'label' => 'admin.fields.menu_item.position',
            ])
            ->add('parent', 'sonata_type_model', [
                'label' => 'admin.fields.menu_item.parent',
                'help' => 'admin.help.menu_item.parent',
                'required' => false,
                'query' => $this->createParentsItemQuery(),
                'preferred_choices' => [],
                'choices_as_values' => true,
            ]);
        $subject = $this->getSubject();

        if ($subject->getIsFullyModifiable()) {
            $formMapper
                ->add('Page', 'sonata_type_model', [
                    'label' => 'admin.fields.menu_item.page',
                    'required' => false,
                    'btn_add' => 'add',
                    'query' => $this->createPageQuery(),
                    'choices_as_values' => true,
                ])
                ->add('link', null, [
                    'label' => 'admin.fields.menu_item.link',
                    'required' => false,
                    'help' => 'admin.help.menu_item.link',
                ]);
        }
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.menu_item.title',
            ])
            ->add('menu', null, [
                'label' => 'admin.fields.menu_item.menu',
                'template' => 'CapcoAdminBundle:MenuItem:menu_show_field.html.twig',
                'menuLabels' => MenuItem::$menuLabels,
            ])
            ->add('isEnabled', null, [
                'editable' => false,
                'label' => 'admin.fields.menu_item.is_enabled',
            ])
            ->add('position', null, [
                'label' => 'admin.fields.menu_item.position',
            ])
            ->add('parent', 'sonata_type_admin', [
                'label' => 'admin.fields.menu_item.parent',
            ])
            ->add('Page', 'sonata_type_admin', [
                'label' => 'admin.fields.menu_item.page',
            ]);
        if (null === $subject->getPage()) {
            $showMapper->add('link', null, [
                'label' => 'admin.fields.menu_item.link',
                'template' => 'CapcoAdminBundle:MenuItem:link_show_field.html.twig',
            ]);
        }

        $showMapper
            ->add('createdAt', null, [
                'label' => 'admin.fields.menu_item.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.menu_item.updated_at',
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }

    private function manageLink($menuItem)
    {
        $page = $menuItem->getPage();
        if ($page) {
            $link = 'pages/' . $page->getSlug();
            $menuItem->setLink($link);
        }
    }

    private function createParentsItemQuery()
    {
        return $this->modelManager
            ->createQuery($this->getClass(), 'p')
            ->where('p.parent IS NULL')
            ->andWhere('p.menu = :header')
            ->setParameter('header', MenuItem::TYPE_HEADER)
            ->andWhere('p.link IS NULL OR p.link = :blankLink')
            ->setParameter('blankLink', '');
    }

    private function createPageQuery()
    {
        return $this->modelManager
            ->createQuery('CapcoAppBundle:Page', 'p')
            ->where('p.isEnabled = :enabled')
            ->setParameter('enabled', true);
    }
}
