<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

use Capco\AppBundle\Entity\Menu;

class MenuItemAdmin extends Admin
{
    protected $datagridValues = array(
        '_sort_order' => 'ASC',
        '_sort_by'    => 'Menu',
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.menu_item.title',
            ))
            ->add('Menu', null, array(
                'label' => 'admin.fields.menu_item.menu',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.menu_item.is_enabled',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.menu_item.position',
            ))
            ->add('parent', null, array(
                    'label' => 'admin.fields.menu_item.parent',
                ),
                'entity',
                array(
                    'query_builder' => $this->createParentsItemQuery()->getQueryBuilder(),
                )
            )
            ->add('Page', null, array(
                'label' => 'admin.fields.menu_item.page',
            ))
            ->add('link', null, array(
                'label' => 'admin.fields.menu_item.link',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.menu_item.title',
            ))
            ->add('Menu', null, array(
                'label' => 'admin.fields.menu_item.menu',
                'template' => 'CapcoAdminBundle:MenuItem:menu_list_field.html.twig',
            ))
            ->add('isEnabled', null, array(
                'editable' => false,
                'label' => 'admin.fields.menu_item.is_enabled',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.menu_item.position',
            ))
            ->add('parent', 'sonata_type_admin', array(
                'label' => 'admin.fields.menu_item.parent',
            ))
            ->add('Page', 'sonata_type_admin', array(
                'label' => 'admin.fields.menu_item.page',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.menu_item.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array('template' => 'CapcoAdminBundle:MenuItem:list__action_delete.html.twig'),
                )
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {

        $formMapper
            ->add('title', null, array(
                'label' => 'admin.fields.menu_item.title',
            ))
            ->add('Menu', null, array(
                'label' => 'admin.fields.menu_item.menu',
                'required' => true,
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.menu_item.position',
            ))
            ->add('parent', 'sonata_type_model', array(
                'label' => 'admin.fields.menu_item.parent',
                'help' => 'admin.help.menu_item.parent',
                'required' => false,
                'query' => $this->createParentsItemQuery(),
                'preferred_choices' => array(),
            ))
        ;

        $subject = $this->getSubject();

        if ($subject->getIsFullyModifiable()) {
            $formMapper
                ->add('isEnabled', null, array(
                    'label' => 'admin.fields.menu_item.is_enabled',
                    'required' => false,
                ))
                ->add('Page', 'sonata_type_model', array(
                    'label' => 'admin.fields.menu_item.page',
                    'required' => false,
                    'btn_add' => 'add',

                ))
                ->add('link', null, array(
                    'label' => 'admin.fields.menu_item.link',
                    'required' => false,
                    'help' => 'admin.help.menu_item.link',
                ))
            ;
        }
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.menu_item.title',
            ))
            ->add('Menu', null, array(
                'label' => 'admin.fields.menu_item.menu',
                'template' => 'CapcoAdminBundle:MenuItem:menu_show_field.html.twig',
            ))
            ->add('isEnabled', null, array(
                'editable' => false,
                'label' => 'admin.fields.menu_item.is_enabled',
            ))
            ->add('position', null, array(
                'label' => 'admin.fields.menu_item.position',
            ))
            ->add('parent', 'sonata_type_admin', array(
                'label' => 'admin.fields.menu_item.parent',
            ))
            ->add('Page', 'sonata_type_admin', array(
                'label' => 'admin.fields.menu_item.page',
            ))
            ->add('link', null, array(
                'label' => 'admin.fields.menu_item.link',
            ))
        ;
    }

    public function prePersist($menuItem)
    {
        $this->manageLink($menuItem);
    }

    public function preUpdate($menuItem)
    {
        $this->manageLink($menuItem);
    }

    private function manageLink($menuItem) {
        $page = $menuItem->getPage();
        if(null != $page){
            $link = $this->routeGenerator->generate('app_page_show', array('slug' => $page->getSlug()));
            $menuItem->setLink($link);
        }
        else {
            $menuItem->setLink(null);
        }
    }

    private function createParentsItemQuery()
    {
        $query = $this->modelManager
                            ->createQuery($this->getClass(), 'p');
        $query->where('p.parent IS NULL')
            ->leftJoin('p.Menu', 'm')
            ->andWhere('m.type = :header')
            ->setParameter('header', Menu::TYPE_HEADER)
            ->andWhere('p.link = :nullLink OR p.link = :blankLink')
            ->setParameter('nullLink', null)
            ->setParameter('blankLink', '');
        return $query;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }

    public function getBatchActions()
    {
        return array();
    }
}
