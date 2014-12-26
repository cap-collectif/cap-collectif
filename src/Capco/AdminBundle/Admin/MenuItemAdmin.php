<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

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
            ->add('isEnabled', null, array('editable' => false))
            ->add('position')
            ->add('parent')
            ->add('Page')
            ->add('link')
            ->add('_action', 'actions', array(
                'actions' => array(
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
            ->add('Menu')
            ->add('title')
            ->add('position')
            ->add('parent', 'sonata_type_model', array(
                                                'help' => 'Non applicable pour les éléments du footer',
                                                'required' => false,
                                                'query' => $this->createParentsItemQuery(),
                                                'preferred_choices' => array()
                                                ))
        ;

        $subject = $this->getSubject();

        if ($subject->getIsFullyModifiable()) {
            $formMapper
                ->add('isEnabled')
                ->add('Page', 'sonata_type_model', array(
                    'required' => false,
                    'preferred_choices' => array()
                ))
                ->add('link', null, array(
                    'required' => false,
                    'help' => 'Si vous avez associé une page à l\'élément de menu, le lien sera défini automatiquement.',
                ))
            ;
        }
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
            ->setParameter('header', Menu::TYPE_HEADER);
        return $query;
    }
}
