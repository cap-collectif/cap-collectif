<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Capco\AppBundle\Entity\FooterSocialNetwork;

class FooterSocialNetworkAdmin extends Admin
{
    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('position')
            ->add('isEnabled')
            ->add('style')
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('title')
            ->add('position')
            ->add('isEnabled', null, array('editable' => true))
            ->add('createdAt')
            ->add('style', 'string', array('template'=>'CapcoAdminBundle:FooterSocialNetwork:style_list_field.html.twig'))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'edit' => array(),
                    'delete' => array(),
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
            ->add('title')
            ->add('link')
            ->add('position')
            ->add('isEnabled')
            ->add('style', 'choice', array('choices'=>FooterSocialNetwork::$socialIcons))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title')
            ->add('link')
            ->add('position')
            ->add('isEnabled')
            ->add('style')
            ->add('createdAt')
            ->add('updatedAt')
        ;
    }
}
