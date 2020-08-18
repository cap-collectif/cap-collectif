<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Filter\KnpTranslationFieldFilter;
use Capco\AppBundle\Manager\MenuItemResolver;
use Capco\AppBundle\Repository\MenuItemRepository;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\AdminType;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class MenuItemAdmin extends AbstractAdmin
{
    protected $classnameLabel = 'menu_item';
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

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', KnpTranslationFieldFilter::class, [
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
                EntityType::class,
                [
                    'query_builder' => $this->createParentsItemQuery(),
                ]
            )
            ->add('Page', null, [
                'label' => 'admin.fields.menu_item.page',
            ])
            ->add('link', KnpTranslationFieldFilter::class, [
                'label' => 'global.link',
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
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

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
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

        $formMapper
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

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();
        $showMapper
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
            $showMapper->add('link', null, [
                'label' => 'global.link',
                'template' => 'CapcoAdminBundle:MenuItem:link_show_field.html.twig',
            ]);
        }

        $showMapper
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
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

    private function createParentsItemQuery()
    {
        return $this->modelManager
            ->createQuery($this->getClass(), 'mi')
            ->leftJoin('mi.translations', 'mit')
            ->where('mi.parent IS NULL')
            ->andWhere('mi.menu = :header')
            ->setParameter('header', MenuItem::TYPE_HEADER)
            ->andWhere('mit.link IS NULL OR mit.link = :blankLink')
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
