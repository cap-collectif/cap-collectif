<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

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
            ->add('Menu')
            ->add('title')
            ->add('isEnabled')
            ->add('createdAt')
            ->add('updatedAt')
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('title')
            ->add('Menu')
            ->add('isEnabled', null, array('editable' => true))
            ->add('position')
            ->add('updatedAt')
            ->add('parent')
            ->add('Page')
            ->add('link')
            ->add('_action', 'actions', array(
                'actions' => array(
                    'edit' => array('template' => 'CapcoAdminBundle:MenuItem:list__action_edit.html.twig'),
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
            ->add('Menu')
            ->add('title')
            ->add('link', null, array('required' => false))
            ->add('isEnabled', 'checkbox', array())
            ->add('position')
            ->add('parent', 'sonata_type_model', array(
                                                'help' => 'Non applicable pour les éléments du footer',
                                                'required' => false,
                                                'query' => $this->createParentsItemQuery(),
                                                'preferred_choices' => array()
                                                ))
            ->add('Page', 'sonata_type_model', array(
                                                'help' => 'Si vous associez une page à l\'élément de menu, le lien sera défini automatiquement.',
                                                'required' => false,
                                                'preferred_choices' => array()
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
        $query->where('p.parent IS NULL');
        return $query;
    }
}
