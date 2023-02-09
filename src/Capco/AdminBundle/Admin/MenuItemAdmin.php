<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Manager\MenuItemResolver;
use Capco\AppBundle\Repository\MenuItemRepository;
use Doctrine\ORM\QueryBuilder;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\ProxyQueryInterface;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\AdminType;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class MenuItemAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'menu_item';
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    private MenuItemResolver $resolver;
    private MenuItemRepository $repository;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        MenuItemResolver $resolver,
        MenuItemRepository $repository
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->resolver = $resolver;
        $this->repository = $repository;
    }

    public function createQuery(): ProxyQueryInterface
    {
        $all = $this->repository->findAll();

        $ids = [];
        foreach ($all as $mi) {
            if ($this->resolver->hasEnabledFeatures($mi)) {
                $ids[] = $mi->getId();
            }
        }

        $query = parent::createQuery();
        $query->andWhere($query->expr()->in($query->getRootAliases()[0] . '.id', ':ids'));
        $query->setParameter('ids', $ids);

        return $query;
    }

    public function prePersist($object): void
    {
        $this->manageLink($object);
    }

    public function preUpdate($object): void
    {
        $this->manageLink($object);
    }

    public function getBatchActions(): array
    {
        return [];
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.position',
            ])
            ->add(
                'parent',
                null,
                [
                    'label' => 'admin.fields.menu_item.parent',
                ],
                [
                    'query_builder' => $this->createParentsItemQuery(),
                ]
            )
            ->add('Page', null, [
                'label' => 'admin.fields.menu_item.page',
            ])
            ->add('link', null, [
                'label' => 'global.link',
            ]);
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->addIdentifier('title', null, [
                'label' => 'global.title',
            ])
            ->add('menu', null, [
                'label' => 'admin.fields.menu_item.menu',
                'template' => 'CapcoAdminBundle:MenuItem:menu_list_field.html.twig',
                'menuLabels' => MenuItem::$menuLabels,
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'global.published',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('parent', AdminType::class, [
                'label' => 'admin.fields.menu_item.parent',
            ])
            ->add('Page', AdminType::class, [
                'label' => 'admin.fields.menu_item.page',
            ])
            ->add('link', null, [
                'label' => 'global.link',
                'template' => 'CapcoAdminBundle:MenuItem:link_list_field.html.twig',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [
                        'template' => 'CapcoAdminBundle:MenuItem:list__action_delete.html.twig',
                    ],
                ],
            ]);
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('title', TextType::class, [
                'label' => 'global.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false,
            ])
            ->add('menu', ChoiceType::class, [
                'label' => 'admin.fields.menu_item.menu',
                'choices' => array_flip(MenuItem::$menuLabels),
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('parent', ModelType::class, [
                'label' => 'admin.fields.menu_item.parent',
                'help' => 'admin.help.menu_item.parent',
                'required' => false,
                'query' => $this->createParentsItemQuery(),
                'preferred_choices' => [],
            ]);
        $subject = $this->getSubject();

        $form
            ->add('Page', ModelType::class, [
                'label' => 'admin.fields.menu_item.page',
                'required' => false,
                'btn_add' => 'add',
                'query' => $this->createPageQuery(),
            ])
            ->add('link', TextType::class, [
                'label' => 'global.link',
                'required' => false,
                'disabled' => !$subject->getIsFullyModifiable(),
                'help' => 'admin.help.menu_item.link',
            ]);
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $subject = $this->getSubject();
        $show
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('menu', null, [
                'label' => 'admin.fields.menu_item.menu',
                'template' => 'CapcoAdminBundle:MenuItem:menu_show_field.html.twig',
                'menuLabels' => MenuItem::$menuLabels,
            ])
            ->add('isEnabled', null, [
                'editable' => false,
                'label' => 'global.published',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('parent', AdminType::class, [
                'label' => 'admin.fields.menu_item.parent',
            ])
            ->add('Page', AdminType::class, [
                'label' => 'admin.fields.menu_item.page',
            ]);
        if (null === $subject->getPage()) {
            $show->add('link', null, [
                'label' => 'global.link',
                'template' => 'CapcoAdminBundle:MenuItem:link_show_field.html.twig',
            ]);
        }

        $show
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ]);
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['list', 'create', 'edit', 'delete']);
    }

    private function manageLink($menuItem)
    {
        $page = $menuItem->getPage();
        if ($page) {
            $link = 'pages/' . $page->getSlug();
            $menuItem->setLink($link);
        } else {
            //In order not to have a null link, we take the route of the default page referring to the same resource
            //And we set it to the newly translated route
            $defaultLocale = $menuItem->getDefaultLocale();
            $translations = $menuItem->getTranslations();
            $defaultTranslation = $translations[$defaultLocale];
            $currentLocale = $menuItem->getCurrentLocale();
            if (!isset($translations[$currentLocale])) {
                if (!isset($menuItem->getNewTranslations()[$currentLocale])) {
                    throw new \RuntimeException('An error occured while creating new translation.');
                }
                $newTranslation = $menuItem->getNewTranslations()[$currentLocale];
                if (isset($defaultTranslation)) {
                    $newTranslation->setLink($defaultTranslation->getLink());
                }
                $newTranslation->setAsNewTranslation($menuItem, $newTranslation);
            }
        }
    }

    private function createParentsItemQuery(): QueryBuilder
    {
        return $this->getModelManager()
            ->createQuery($this->getClass(), 'mi')
            ->leftJoin('mi.translations', 'mit')
            ->where('mi.parent IS NULL')
            ->andWhere('mi.menu = :header')
            ->setParameter('header', MenuItem::TYPE_HEADER)
            ->andWhere('mit.link IS NULL OR mit.link = :blankLink')
            ->setParameter('blankLink', '');
    }

    private function createPageQuery(): QueryBuilder
    {
        return $this->getModelManager()
            ->createQuery('CapcoAppBundle:Page', 'p')
            ->where('p.isEnabled = :enabled')
            ->setParameter('enabled', true);
    }
}
