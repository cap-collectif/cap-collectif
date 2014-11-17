<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

use Capco\AppBundle\Entity\Menu;

class MenuAdmin extends Admin
{
    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('type', 'doctrine_orm_string', array(), 'choice', array('choices' => Menu::$types))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('type', null, array('template' => 'CapcoAdminBundle:Menu:type_list_field.html.twig'))
            ->add('_action', 'actions', array(
                'actions' => array()
            ))
        ;
    }


    public function getBatchActions()
    {
        return array();
    }
}
