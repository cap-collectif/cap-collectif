<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class SiteImageAdmin extends Admin
{
    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title')
            ->add('isEnabled')
            ->add('Media');
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('title')
            ->add('isEnabled', null, array('editable' => true))
            ->add('Media', 'sonata_media_type', array(
                'template' => 'CapcoAdminBundle:SiteImage:media_list_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'context' => 'default'))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'edit' => array(),
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
            ->add('isEnabled')
            ->add('Media', 'sonata_media_type', array(
                'provider' => 'sonata.media.provider.image',
                'context' => 'default'))
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title')
            ->add('Media', 'sonata_type_media', array(
                'template' => 'CapcoAdminBundle:SiteImage:media_list_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'context' => 'default'))
            ->add('isEnabled')
        ;
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('list', 'edit'));
    }


    public function getBatchActions()
    {
        return array();
    }
}
